[kb_limit: 256000]
[ms_limit: 1000]
[rating: 340]
[creation: 2023-08-24T16:00]

Mugs has recently been trying to implement his own version of [quine-relay](https://github.com/mame/quine-relay). In case you don't know, a quine is a program whose output is itself! In the case of quine-relay, the program actually goes through multiple intermediate languages before it finally outputs itself again.

Unfortunately for Mugs, he is new to the `mug++` programming language and he inadvertently introduced undefined behavior! Even more frustratingly, this undefined behavior introduced non-deterministic properties! This means that on different days, his program produces slightly different outputs.

Formally, Mugs has $1 \le N \le 10^5$ programs. The output of one program is guaranteed to be the source code of another of Mugs' program. The output Mugs expects program $i$ will output is given by $o_i$, where $1 \le o_i \le N$. 

Mugs wants to repeatedly run the set of programs on each day from $1 \ldots D$, where $1 \le D \le 10^5$, until they either loop back on themselves or are stuck in infinite loop. Due to the undefined behavior, on day $d$, exactly one program may output a different program than the one Mugs is expecting it will output. 

For every single program, we label it a "Mugs Certified Quine Source" if iteratively running the output of that program will eventually output the original program again. Of course, since the output of a program varies by day, a program may only be a "Mugs Certified Quine Source" on only a subset of all days. Your task, then, is the following: for every single program $i$, output the amount of days when it is a "Mugs Certified Quine Source."

# Input

The first line contains $N$ and $D$. 

The next line contains $N$ integers, $o_1 \ldots o_N$, denoting the expected output for each program.

The next $D$ lines contain $2$ integers, $s_d$ and $y_d$, denoting that on the $d$th day, program $s_d$ will output $y_d$ instead of $o_d$ (it may be possible that $y_d = o_d$).

# Output

Output $N$ space separated integers, where the $i$th integer is the amount of days when the program $i$ is a "Mugs Certified Quine Source".

# Example

```in
4 2
2 3 4 4
4 2
3 1
```
```out
1 2 2 2
```

On day 1, the effective $p$ list is `2 3 4 2`, which means that programs $2, 3,$ and $4$ are quine sources. On day 2, the effective $p$ list is `2 3 1 4`, which means that all programs are quine sources. Note that the errors on day 1 do not propagate to day 2.

# Variations
See Nondeterministic Quines I! Although, it is quite a different problem. 

Problem Credits: Manu. Tested by Jiaming.