[kb_limit: 256000]
[ms_limit: 1000]
[rating: 330]
[creation: 2023-08-14T16:00]
[close:    2023-08-14T16:00]

TODO:

We are given problems and a nondeterministically executing problems such that we essentially have a markov chain of problems. We want to find the probability a particular problem will end up as another problem after 10^9 iterations. However, compiler errors change the probability matrix every so often.

Solution: Matrix exponentiation
