[kb_limit: 256000]
[ms_limit: 1000]
[rating: 100]
[creation: 2023-08-14T16:00]
[close: 2023-08-14T16:00]

Problems (and problem ideas) I am generally too lazy to write out fully or write the solution to.

1. Mugs has N <= 100 shirt in his collection. Every day, he takes the top most shirt in his collection, wears it, and then puts it in his laundry basket. Mugs tries to keep his laundry routine consistent, but it sometimes switches. In particular, he initially washes his clothes every $L_0$ days and completes $K_0$ such rounds, then he completes $K_1$ rounds where he washes his clothes every $L_1$ days and so on for all $L_i$ where $1 \le i \le Q$. It is guaranteed that Mugs will always have a shirt to wear. Please print out the probability of Mugs wearing each shirt on the D <= 10^9 th day. Solution: Matrix exponentiation/dp.
   Can prob increase constraints*
2. Mugs wants to pick a particular subsequence from a string (or any integer sequence really), such that the subsequence can be perfectly decomposed into a set of disjoint substrings that are all 5 letter palindromes. Help Mugs maximize the length of such a subsequence. Consider what happens if we change $5$ to some parameter $1 \le K \le 100$. Solution: dp
3. You are given a sequence of characters length N <= 1000 and of length M <= 1000. For the next Q <= 10^5 queries, you will be given a subrange on the first sequence and a subrange on the other sequence. Output the number of substrings in the first subrange that are also present in the second subrange (duplicates count twice). solution: dp

Other ideas
- somethign to do with binary strings with two bits set such that it forms an edge?
- doppler radar problem
- physics contour lines, is it valid?
  given a see saw and a bunch of positions, can you balance it out?
- toothpicks is an edge and you need to make it matching stuff
- waitlists and people dropping and stuff?
- tab a bunch of regions, but they cannot be negative, what is the effective tab at the end?
- exponential off by ones (check every possible configuration of off by one)
- Ants infinite death circle
- binary search on when a nan appears
- temperature optimization
