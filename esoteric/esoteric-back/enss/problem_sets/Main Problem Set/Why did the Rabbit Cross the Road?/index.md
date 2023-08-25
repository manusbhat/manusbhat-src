[kb_limit: 256000]
[ms_limit: 1000]
[rating: 260]
[creation: 2023-08-14T16:00]

TODO: untested

Alice's $1 \le N \le 10^5$ friends are evenly spaced on a circle, essentially forming a $N$-gon. Alice's $i$th friend is a bunny who is trying to reach the $c_i$th bunny, where $1 \le c_i \le N$. At noon, all bunnies will travel in a straight line towards their target bunny. 

Alice is watching from above, and noticed that the paths of some rabbits cross! She is curious about how many pairs of rabbits will have their paths cross orthogonally (endpoints inclusive). Essentially, if we plot the two bunnies paths, they must form an intersection within the circle at a right angle.

Help Alice out! How many pairs of rabbits will have their paths cross orthogonally?

# Input

The first line contains $N$. The next line contains $N$ integers $c_1, c_2, \ldots, c_N$, denoting that the $i$th bunny is trying to reach the position of the $c_i$th bunny. It is guaranteed that $c_i \neq i$ for all $i$.

# Output

Output one line, the number of pairs of rabbits whose paths cross orthogonally. Remember to use `long long`!

# Example

```in
4
4 4 1 3
```
```out
2
```

Rabbit $2$ and $3$ will cross paths orthogonally. Rabbits $1$ and $4$ will cross paths orthogonally as well since we are counting end points.

Problem Credits: Manu