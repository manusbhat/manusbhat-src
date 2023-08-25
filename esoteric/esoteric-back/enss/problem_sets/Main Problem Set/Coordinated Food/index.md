[kb_limit: 256000]
[ms_limit: 1000]
[rating: 220]
[creation: 2023-08-14T16:00]

TODO: untested

Alice's $1 \le N \le 10^5$ friends are trying to eat strawberries! Alice's $i$th friend is located at $0 \le x_i \le 10^9$, and is trying to eat the strawberry located at $-10^9 \le s_i \le 10^9$ (multiple strawberries can be at the same location!). 

However, the bunnies need to jump in unison. Together, the bunnies must choose a single $1 \le K \le 10^9$ such that each bunny can reach their strawberry by making jumps of length $K$ to the left or right. Moreover, the must jump in unison: all bunnies must jump at the same time, and all must make a uniform decision of whether to jump left or right for each individual jump. However, once a bunny reaches his or her strawberry, they exit the simulation and no longer need to jump.

If $K$ is chosen optimally, what is the minimum amount of jumps before all bunnies have reached their strawberries? 

# Input

The first line contains $N$. The next $N$ lines contain two integers $x_i, s_i$, denoting that the $i$th bunny is located at $x_i$ and the $i$th strawberry is located at $s[i]$.

# Output

Output one line, the minimum amount of jumps required to ensure that all bunnies have reached their strawberries. 

# Example

```in
4
1 4 7 10
9 4 7 14
```
```out
2
```

If we let $K = 4$, then the second and third bunny exit immediately. After a single jump right, the fourth bunny can reach his strawberry. After one more jump, the first bunny can reach his strawberry. Thus, the answer is $2$.

```in

Problem Credits: Manu