#include "libgrade.h"

int init(void) {
    return 12;
}

int visited[100000];
pair<ll, ll> e1, e2;

ll dfs(ll n, ll p, adjl& adj) {
    if (visited[n]) return n;
    visited[n] = 1;

    for (ll child: adj[n]) {
        if (child != p) {
            if (visited[child]) {
                // first edge
                e1 = {n, child};
                return child;
            }
            ll res = dfs(child, n, adj);
            if (res == -1) {
                continue;
            }
            else if (res == n) {
                // second edge
                e2 = {n, child};
                return -1;
            }
            else {
                // continue cycle
                return res;
            }
        }
    }

    return -1;
}

ll dfs2(ll n, ll p, adjl& adj, pair<ll, ll>& ban) {
    ll res = 0;
    for (ll child: adj[n]) {
        if (child != p && (n != ban.first || child != ban.second) && (n != ban.second || child != ban.first)) {
            res = max(res, dfs2(child, n, adj, ban) + 1);
        }
    }

    return res;
}

ll solve(adjl& adj) {
    // can do two pointers but whatever
    memset(visited, 0, sizeof visited);
    dfs(0, -1, adj);

    return max(dfs2(0, -1, adj, e1), dfs2(0, -1, adj, e2));
}

bool ok(int n, opipe& out, ipipe& in) {
    ll N = randl(2, 1e5);
    adjl adj = randtree(N);

    // ensure edge is not duplicate
    ll first = n < 6 ? 0 : randl(1, N);
    ll second;
    do {
        second = randl(0, N);
    } while (second == first || find(all(adj[first]), second) != adj[first].end());

    adj_edge(adj, first, second);

    out << N << '\n';
    print_adjl(adj, out);
    out.flush();

    ll ans = solve(adj);
    ll pred;
    in >> pred;

    return pred == ans;
}