[kb_limit: 256000]
[ms_limit: 1000]
[rating: 350]
[creation: 2023-08-14T16:00]
[close: 2023-08-14T16:00]

TODO: 

We are given a set of points such that all x coordinates are distinct and all y coordinates are distinct. Then, we have a starting vertex, and an ending vertex. Every other vertex has associated value associated with it. A path is considered valid if it starts at the start vertex, travels through some possibly empty subset of other vertices, hits the end vertex, then returns to the start vertex (again through some possibly non empty subset of vertices). Moreover, on the start journey, his x coordinate should be strictly tending toward the final x coordinate, and on the return journey, strictly tending toward the starting x coordinate. Finally , if we plot the return journey on the 2D plane, it mustn't intersect the forward journey. Each time we visit a vertex, we add its associated value. Find the expected value of the score over all possible such paths. It can be shown at least one path exists.

Solution: O(N^3). Build the start and return journeys together (from the start node), where dp[x][y] denotes the expected value of the path if our forward is currently at $x$ and our reverse is currently $y$. Transitions happen from $min(x,y)$ and go forward to all possible values.

Problem Credits: Manu