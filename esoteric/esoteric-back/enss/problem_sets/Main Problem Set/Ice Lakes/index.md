[kb_limit: 256000]
[ms_limit: 1000]
[rating: 290]
[creation: 2023-08-21T16:00]
[close:    2023-08-21T16:00]

TODO!

Consider an $N \times M$ blocks of points, such that some subset is filled with ice and the rest with water. We are guaranteed two blocks of each type. Let T denote the amount of time it takes for the ice to melt. At each timestep, any ice that directly neighbors water in any of the four cardinal directions melts. Consider the following problem, if we are allowed to place a single ice block to fill up any of the current water blocks, what is the maximum amount of time $T'$ the simulation will last for if we place it optimally.

Solution: O(NM). We can do a multisource BFS from the water blocks to figure out the distance to the nearest water block for each ice block. Moreover, we also keep track for each node if it is a minimal distance away from multiple such ice blocks (which can be done via bookkeeping in the BFS). Then, we iterate through all possible maximum depth ice blocks and if any have multiple "parent" water blocks, we can extend by one, otherwise we cannot extend. However, there is the caveat that water blocks in 1x1 regions can possibly extend the simulation by more than that. For this, we again do a BFS from these blocks specifically, and essentially keep iterating the wavefront until the blocks at the wavefront no longer consider that 1x1 block the closest water block. If done carefully, we can compute the maximum amount of time we can extend the simulation by. It can be shown that all steps can be completed in O(NM) time.

Problem Credits: Manu