[kb_limit: 256000]
[ms_limit: 1000]
[rating: 330]
[creation: 2023-08-14T16:00]
[close: 2023-08-14T16:00]

TODO: 

Consider a tree where every single node has a given range. For all nodes, output the number of roots such that the paths from the root to the node have a nonempty intersection of ranges.

Solution: Tree DP with rerooting. In particular, we first calculate the answer for each subtree (fast set merging is helpful). Then, we calculate for each node how many nodes up we can go before the intersection is empty (which can be done somewhat using a two pointers strategy from the root). This gives us the majority of the answer, for the rest, we calculate the base answer for each of the roots children, and then see how the application of the intersection of the path from the root to the current node changes the answer for the entire tree, minus the answer for the current node highest ancestor that is a child of the root. O(N).

Problem Credits: Manu