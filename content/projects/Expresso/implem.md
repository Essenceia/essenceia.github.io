---
draft: true
---



Synth 

rtl with `prio_req_q` being a onehot0 vector : 
 
```
reg [MAC_W-1:0] req_mac;
int x;
always @(*) begin
        req_mac = {MAC_W{1'b0}};
        for (x = 0; x < PORT_CNT; x = x + 1) begin
            if (prio_req_q[x])
                        req_mac = req_mac | req_mac_i[(x+1)*MAC_W-1-:MAC_W];
        end
end
```

```
26. Executing PROC_MUX pass (convert decision trees to multiplexers).
```


```
Creating decoders for process `$paramod$525695c4440a04e4091333611edf3ab7e075de31\arbitor.$proc$/home/gp/asic/coffeepot/src/arbitor.v:42$218'.
     1/3: $3\req_mac[47:0]
     2/3: $2\req_mac[47:0]
     3/3: $1\req_mac[47:0]
```
