[kb_limit: 256000]
[ms_limit: 1000]
[rating: 160]
[creation: 2023-08-14T16:00]

Mugs and Alice are at Wilson Park, where there are $3 \le N \le 10^5$ burrows, connected by $N$ bi-directional tunnels such that every burrow can be reached from another. What? $N$ tunnels? That's right, $N$ tunnels. Mugs is a bit of a tunnel enthusiast, and he's been working on a tunneling project for the past few years. He's finally finished, and he's ready to show it off to Alice. 

Unfortunately, Alice is more a tree enthusiast and wants to remove one tunnel such that the resultant graph is a tree. Specifically, she wants to remove one tunnel such that the graph is still connected. Moreover, across all possible edges, she must choose the one that forms the deepest tree when rooted at burrow $1$. We claim a tree is deeper than another tree if any of its leaves have a greater distance from the root than all leaves of the other tree. 

Help Alice determine the maximum depth of the tree she can form by removing one tunnel!

# Input

The first line contains $N$. The next $N$ lines contain two integers $1 \le a_i, b_i \le N$, denoting that burrows $a_i$ and $b_i$ are connected by a tunnel. It is guaranteed that graph is simple and connected.

# Output

Output one line, the maximum depth of the tree Alice can form by removing one tunnel.

# Example

```in
4
1 2 
2 3
3 4
4 2
```
```out
3
```

If the edge between $2$ and $3$ is removed, the resultant graph is a tree with depth $3$ (depth is zero indexed).

Problem Credits: Manu