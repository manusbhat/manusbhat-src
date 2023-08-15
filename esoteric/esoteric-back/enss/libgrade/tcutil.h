#pragma once

#include <bits/stdc++.h>

using namespace std;

using l = long long;
using b = bool;
using vl = vector<l>;
using sl = set<l>;
using adj = vector<vl>;

#define bg(x) begin(x)
#define all(x) bg(x), end(x)

constexpr l INF = 0x7f7f7f7f7f7f7f7f;

l randl(l s, l e) {
    return s + (l) rand() % (e - s);
}

vl randvl(int n, l s, l e) {
    vl v(n);
    for (int i = 0; i < n; i++) {
        v[i] = randl(s, e);
    }

    return v;
}

sl randsl(int n, l s, l e) {
    sl v;
    while (v.size() < n) {
        v.insert(randl(s, e));
    }

    return v;
}

vl sltovl(const sl& s) {
    vl v(all(s));
    return v;
}

adj randgraph(l n, l m, b simple=true);
adj randdag(l n, l m, b simple=true);
adj randtree(l n);
