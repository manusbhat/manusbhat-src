[kb_limit: 256000]
[ms_limit: 1000]
[rating: 150]
[creation: 2023-08-21T16:00]

At Wilson Park, Mugs and his friends are lined up in a $N$ by $M$ grid, where $1 \le N, M \le 1000$. At each cell in the grid, there is a rabbit of species $1 \le i \le MN$. The sub-biodiversity of 2 adjacent rabbits with species $i$, $j$ to be $|i-j|$, and the biodiversity of the grid is said to be the sum of the sub-biodiversity of all pairs of adjacent cells (cardinal directions). Mugs' has been feeling awfully eugenic lately, and his goal is to modify the grid so the biodiversity is at most some integer constant $K$.

You may modify the grid as follows: you can choose a number $i \le MN$, and remove all rabbits of species $j$ where $j \ge i$. When removing a particular rabbit, all sub-biodiversity associated with that rabbit are removed from the total biodiversity, unless they were removed previously (by the other pair). Find the maximal $i$ you must choose to achieve the goal.

# Input

The first line contains $N, M,$ and $K$. 
The next $N$ lines contain $M$ integers, where the $j$th entry of the $i$th line indicates the species of the rabbit at $(i, j)$.

# Output

Output one line, the maximal $i$ such that removing all species greater than or equal to $i$ will result in a biodiversity of at most $K$. It is guaranteed that $K$ is strictly less than the initial biodiversity, and that the initial biodiversity is positive.

# Example

```in
3 3 4
2 1 1
3 2 3
1 1 2
```
```out
3
```

Initially, the field has biodiversity $12$
When $P = 0$, it can be shown that the answer is always $2^{N-1}$ (subject to mods). If we set $i = 3$, then we remove all the $3$s from the grid, which results in a new biodiversity of $4$, which just meets the requirement.

Problem Credits: Manu. Tested by Jiaming.