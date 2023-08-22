[kb_limit: 256000]
[ms_limit: 1000]
[rating: 150]
[creation: 2023-08-21T16:00]

Alice has recently been delving into information theory! She has been reading about the concept of a bitstring, which is just a list of 0s and 1s. In particular, she has developed a certain routine whenever she sees a bitstring. First, she looks at all occurrences of `01` substrings in the string, and marks all the `1`s in the deletion pile. Simultaneously, she looks at all occurences of `10` (which can possibly overlap with the `01`s) and marks all the `0`s in the flip pile. Finally, she deletes all the `1`s in the deletion pile and flips all the `0`s in the flip pile to become `1`s. Then, she restarts the procedure. This continues until she is unable to perform any more operations, at which point she moves onto the next bitstring. 

For instance, when she sees the string `0011`, the first 1 will be deleted giving us `001`, then right after we get `00` at which point the process terminates. If instead the original string was `010`, we would mark the last `0` in the flip pile and the `1` in the delete pile, giving us `01`, which then becomes `0`.

Mugs is very angry that Alice is polluting the yard with all these digits! Therefore, before Alice sees any bitstring, Mugs has decided to partition it into some disjoint set of nonempty bitstrings (essentially, he makes 0 or more cuts, splitting the bitstring into pieces). From here, Alice will perform her routine on all resultant bitstrings independently. 

Mugs hopes that by cutting the bitstring into pieces, the amount of final digits (summed up over all the resultant strings) is minimized. Assuming he partitions the string optimally, what is the minimum number of digits that will be left after the simulation? 

# Input

The first line contains a single integer $N$, where $1 \le N \le 10^5$. The next line contains a bitstring with length $N$.

# Output

Output one line, the minimum number of digits that will be left after the simulation if Mugs partitions it optimally.

# Example
```in
10
1110001101
```
```out
6
```

In this example, Mugs can possibly partition the string into `11`, `10`, and `001101`. Alice will leave the first string untouched and transform the second bitstring into `11`. The third bitstring will go through the following procedure: `001101` $\to$ `0011` $\to$ `001` $\to$ `00`. Since each substring ends up with $2$ digits, the total number of digits left is $2 + 2 + 2 = 6$. This is the minimum possible number of digits left after the simulation.

Problem Credits: Manu