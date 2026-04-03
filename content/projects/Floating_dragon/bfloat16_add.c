
#include <stdint.h>
#include <stddef.h>
#include <stdfloat>
#include <stdbool.h>
#include <stdlib.h>
#include <stdio.h>

/*******
 * Env *
 *******/

/* Assert. */
#define assert(cdt) ({if (!(cdt)) {printf("%s:%s : assert(%s) failed.\n", __FILE__, __LINE__, #cdt); abort();}})

#ifdef DEBUG
#define check(cdt) ({if (!(cdt)) {printf("%s:%s : check(%s) failed.\n", __FILE__, __LINE__, #cdt); abort();}})
#else
#define check(cdt) ({;})
#endif

#define swap(a, b) ({auto _ = b; b = a; a = _;})

typedef bool u1;
typedef uint8_t u8;
typedef uint16_t u16;
typedef uint64_t u64;

typedef std::bfloat16_t bfloat16_t;

/*********
 * Types *
 *********/

typedef struct bf16 bf16;

/**************
 * Structures *
 **************/

/*
 * Bfloat 16.
 */
struct bf16 {
	union {
		struct {
			u16 frc:7;
			u16 exp:8;
			u16 sig:1;
		};
		u16 raw;
	};
};

/*
 * Special values.
 */

/* Special exponent. */
#define BF16_EXP_SPC 0xff

/* Special nummber : infinity frac. */
#define BF16_SPC_FRC_INF 0

/*************
 * Utilities *
 *************/

/*
 * If @val is special, return 1.
 * Otherwise, return 0.
 */
static inline u1 bf16_is_spc(
	bf16 val
)
{
	return val.exp == BF16_EXP_SPC;
}

/*
 * If @val is an infinity, return 1.
 * Otherwise, return 0.
 */
static inline u1 bf16_is_inf(
	bf16 val
)
{
	return bf16_is_spc(val) && (val.frc == BF16_SPC_FRC_INF);
}

/*
 * If @val is a nan, return 1.
 * Otherwise, return 0.
 */
static inline u1 bf16_is_nan(
	bf16 val
)
{
	return bf16_is_spc(val) && (val.frc != BF16_SPC_FRC_INF);
}

/*
 * If @val is negative, return 1.
 * Otherwise, return 0.
 */
static inline u1 bf16_is_neg(
	bf16 val
)
{
	return val.sig;
}

/*
 * If @val is 0 or a subnormal, return 1.
 * Otherwise, return 0.
 */
static inline u1 bf16_is_nul_or_sub(
	bf16 val
)
{
	return val.exp == 0;
}

/*
 * If @val is a subnormal, return 1.
 * Otherwise, return 0.
 */
static inline u1 bf16_is_sub(
	bf16 val
)
{
	return bf16_is_nul_or_sub(val) && val.frc != 0;
}

/*
 * If @val is zero (plus or minus) return 1.
 * Otherwise, return 0.
 */
static inline u1 bf16_is_nul(
	bf16 val
)
{
	return (val.exp == 0) && (val.frc == 0);
}


/*
 * If @val is regular (not inf, not nan, not subnormal), return 1.
 * Otherwise, return 0.
 */
static inline u1 bf16_is_reg(
	bf16 val
)
{
	return (!bf16_is_spc(val)) && (!bf16_is_sub(val));
}

/*
 * Get @val's complete mantissa with bit 1 placed at offset 31.
 */
static inline u64 bf16_frc_to_arr(
	bf16 val
)
{
	check((1 << 7) == 0x80);
	check(bf16_is_reg(val));
	const u64 arr = (1 << 31) | (((u64) val.frc) << 24);
	check(((arr >> 24) & 0x7f) == val.frc);
	check(((arr >> 24) & 0x80) == 0x80);
	check((arr >> 32) == 0);
	check(arr & 0xffffff == 0);
	return arr;
}

/*
 * Return the opposite of @val.
 */
static inline bf16 bf16_opp(
	bf16 val
)
{
	val.sig = val.sig ? 0 : 1;
	return val;
}

/*******
 * API *
 *******/

/*
 * Addition.
 */
static inline bf16 bf16_add(
	bf16 src0,
	bf16 src1
)
{

	/* Check regularity. */
	assert(bf16_is_reg(src0));
	assert(bf16_is_reg(src1));

	/* If both are null, return 0. We have a lookup table for the sign.
	 * If one is null, return the other. */
	{
		const u1 nul0 = bf16_is_nul(src0);
		const u1 nul1 = bf16_is_nul(src1);
		if (nul0 && nul1) {
			return (bf16) {.frc = 0, .exp = 0, .sig = (u16) (src0.sig & src1.sig)};
		} else if (nul0 || nul1) {
			return (nul0) ? src1 : src0;
		}
	}

	/* Ensure that abs(src0) >= abs(src1). */
	const u1 swp = (
		(src1.exp > src0.exp) ||
		((src1.exp == src0.exp) && (src1.frc > src0.frc))
	);
	if (swp) {
		swap(src0, src1);
	}

	/* Ensure src0 is positive. */
	const u1 neg = bf16_is_neg(src0);
	if (neg) {
		src0 = bf16_opp(src0);
		src1 = bf16_opp(src1);
	}
	check(src0.exp >= src1.exp);
	check(src0.sig == 0);

	/* Get exponents. */
	const u16 exp0 = src0.exp;
	const u16 exp1 = src1.exp;
	check(exp0 > 0);
	check(exp1 > 0);
	check(exp0 < 255);
	check(exp1 < 255);

	/* Get the mantissa shift amount. */
	check(exp0 >= exp1);
	const u16 shf = exp0 - exp1;
	check(shf <= 253);

	/* Generate mantissas with the shadow 1 bit placed at offset 31.
	 * Everything on range [32, 63] is null.
	 * Everything on range [0, 23] is null. */
	const u64 mnt0 = bf16_frc_to_arr(src0);
	u64 mnt1 = bf16_frc_to_arr(src1);

	/* Shift @mnt1 to match @src0's exponent.
	 * There are only 32 meaningful bits.
	 * If right shift more (>=) than 32, @src0 is effectively
	 * null. */
	mnt1 = (shf >= 32) ? 0 : (mnt1 >> shf);

	/* After shift, mnt0 shoudl be greater than mnt1. */
	check(mnt0 >= mnt1);

	/* Do the required operation. */
	const u1 sub = (bf16_is_neg(src1));
	const u64 mntr = sub ? mnt0 - mnt1 : mnt0 + mnt1;

	/* Initialize the sign part of the result. */
	bf16 res;
	res.sig = neg;

	/* If there are bits in the [32, 63] range (overflow), right shift and update the exponent. */
	if (mntr >> 32) {

		/* Only a single bit overflow is meaningful. */
		check(!(mntr >> 33));

		/* Only happens after sub. */
		check(!sub);

		/* The exponent of src0 is used. Increment it. */
		check(exp0 < 255);
		u16 expr = exp0 + 1;
		check(expr > exp0);

		/* If infinity, round down. */
		if (expr == 255) {
			res.frc = 0x7f;
			res.exp = 254;
		}

		/* Otherwise, just use this exponent and right shift the mantissa of 1. */
		else {
			res.frc = ((mntr >> 1) >> 24) & 0x7f;
			res.exp = expr;
		}

	}

	/* If there are no bits in the [32, 63] range, left shift and update the exponent. */
	else {

		/* If bit 31 is not set, check that a subtraction was performed. */
		check((mntr & (1 << 31)) || sub);

		/* Determine the index of the first set bit and the shift count.
		 * We shift at most of 31. */
		u64 mnt_shf = 0;
		u8 shf_cnt = 0;
		for (shf_cnt = 0; shf_cnt <= 31; shf_cnt++) {
			const u64 mnt_shf = mntr << shf_cnt;
			if (mnt_shf & (1 << 31)) {
				goto found;
			}
		}

		/* If not found, default to 0. */
		goto zero;
		found:;

		/* If the shift count leaves an exponent > 0,
		 * compute the result. */
		if (exp0 > shf_cnt) {
			check(mnt_shf & (1 << 31));
			res.frc = (mnt_shf >> 24) & 0x7f;
			res.exp = exp0 - shf_cnt;
		}

		/* Zero case.
		 * Hit if set bit not found or if shift count
		 * is greater than the exponent. */
		else {
			zero:;
			res.frc = 0;
			res.exp = 0;
		}

	}

	/* Swap doesn't matter as we're doing a sum.
	 * neg already handled when initializing the sign. */

	/* Complete. */
	return res;

}

int main() {
	bf16 f0 = {.frc = 0, .exp = 1, .sig = 0};
	bf16 r = bf16_add(f0, f0);
	return 0;
}
