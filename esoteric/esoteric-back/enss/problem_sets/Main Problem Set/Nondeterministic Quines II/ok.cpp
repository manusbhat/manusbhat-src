#include "libgrade.h"

int init(void) {
    return 12;
}

bool in_cycle[100000];
ll component[1000000];
ll component_delta[100000];
ll pre[100000], post[100000];
ll sum[100000];
vl child[100000];
ll timer;

void build_child(vl& default_parent) {
    for (int i = 0; i < default_parent.size(); ++i) {
        child[default_parent[i]].push_back(i);
    }
}

ll find_root(int n, vl& parent) {
    if (component[n] >= 0) return component[n];
    else if (component[n] == -2) {
        return component[n] = n;
    }
    else {
        component[n] = -2;
        return component[n] = find_root(parent[n], parent);
    }
}

void mark_cycles(int n, vl& parent) {
    if (in_cycle[n]) return;
    in_cycle[n] = true;
    mark_cycles(parent[n], parent);
}

void euler(ll n) {
    pre[n] = timer++;
    for (ll m: child[n]) {
        if (m != component[m]) {
            euler(m);
        }
    }
    post[n] = timer;
}

void prefix(ll n) {
    for (ll m: child[n]) {
        if (m != component[m]) {
            prefix(m);
            sum[n] += sum[m];
        }
    }
}

vl solve(vl default_parent, vector<pair<ll, ll>> days) {
    timer = 0;
    fill(child, child + 100000, vl{});
    memset(child, 0, sizeof child);
    memset(pre, 0, sizeof pre);
    memset(post, 0, sizeof post);
    memset(sum, 0, sizeof sum);
    memset(in_cycle, 0, sizeof in_cycle);
    memset(component, -1, sizeof component);
    memset(component_delta, 0, sizeof component_delta);

    int N = default_parent.size();
    int D = days.size();

    build_child(default_parent);
    for (int i = 0; i < N; ++i) find_root(i, default_parent);
    for (int i = 0; i < N; ++i) if (i == component[i]) mark_cycles(i, default_parent);
    for (int i = 0; i < N; ++i) if (i == component[i]) euler(i);

    for (const auto& d : days) {
        if (component[d.first] != component[d.second]) {
            // no contribution for this cycle
            if (in_cycle[d.first]) {
                component_delta[component[d.first]]--;
            }
            continue;
        }

        if (component[d.first] == d.first) {
            // root
            component_delta[component[d.first]]--;
            sum[d.second]++;
        }
        else if (in_cycle[d.first]) {
            // other edge
            component_delta[component[d.first]]--;

            if (pre[d.first] <= pre[d.second] && post[d.second] <= post[d.first]) {
                // below
                sum[d.second]++;
                sum[default_parent[d.first]]--;
            }
            else if (pre[d.first] <= pre[d.second] && post[d.second] <= post[d.first]) {
                // above
                sum[default_parent[component[d.first]]]++;
                sum[default_parent[d.first]]--;
                sum[d.second]++;
            }
            else {
                // different branch
                sum[d.second]++;
                sum[default_parent[d.first]]--;
                sum[default_parent[component[d.first]]]++;
            }
        }
        else {
            if (pre[d.first] <= pre[d.second] && post[d.second] <= post[d.first]) {
                // below
                sum[d.second]++;
                sum[default_parent[d.first]]--;
            }
        }
    }

    // sum up subtrees using component_delta and prefix sum
    for (int i = 0; i < N; ++i) if (i == component[i]) prefix(i);

    vl ret(N);
    for (int i = 0; i < N; ++i) {
        ret[i] = sum[i] + (D + component_delta[component[i]]) * in_cycle[i];
    }
    return ret;
}


bool ok(int n, opipe& out, ipipe& in) {
    // TODO: tests cases are terrible for this one..
    ll N = randl(4e4, 5e4);
    ll D = randl(4e4, 5e4);

    vl parent;
    // permutation graph
    if (n == 4) {
        parent = randpl(N);
        for (int i = 0; i < N; ++i) --parent[i];
    }
    else if (n == 6) {
        parent = vl(N);
        for (int i = 0; i < N; ++i) parent[i] = min((ll) i, N - 1);
    }
    else {
        parent = randvl(N, 0, N);
    }

    // yeah we realistically should ensure all of the different types are represented
    // but i feel like there's a pretty good chance that's going to happen anyways?
    // hard to enforce roots anyways
    vl day_starts = randvl(D, 0, N);
    vl day_ends = randvl(D, 0, N);
    vector<pair<ll, ll>> days;
    for (int i = 0; i < D; ++i) days.emplace_back(day_starts[i], day_ends[i]);


    out << N << ' ' << D << '\n';
    for (int i = 0; i < N; ++i) out << parent[i] + 1 << ' ';
    out << '\n';
    for (int i = 0; i < D; ++i) {
        out << day_starts[i] + 1 << ' ' << day_ends[i] + 1 << '\n';
    }
    out.flush();

    vl ans = solve(parent, days), pred;
    for (int i = 0; i < N; ++i) {
        ll c;
        in >> c;
        if (c != ans[i]) return false;
    }

    return true;
}