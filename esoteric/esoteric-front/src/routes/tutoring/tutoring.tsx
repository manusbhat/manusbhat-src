import { useRef, useState } from "react";
import { StandardTemplate } from "../../framework/template";
import { UserState, authentication_request, request, useUser, useWorker } from "../../framework/proxy";
import { Link, useParams } from "react-router-dom";
import { Markdown } from "../../framework/markdown";

import "./tutoring.css"
import { Separator } from "../../framework/separator";

type TestCaseStatus = {
    status: number,
    kb_used: number,
    ms_used: number
};

const LOADING_STATUS = -2;
const MAX_FILE_SIZE  = 1024 * 16;

function ProblemConfig(props: { name: string, set: string, rating: number, kb_limit: number, ms_limit: number, closes: Date | null }) {
    return (
        <div className="tutoring-problem-header">
            <div className="tutoring-problem-title">
                <h1>{props.name}</h1>
                {/* <h2>{props.set}</h2> */}
            </div>

            <div className="tutoring-problem-subtitle">
                <b>Memory Limit:</b>
                <p>{Math.floor(props.kb_limit / 1024)} MiB</p>

                <b>Time Limit:</b>
                <p>{props.ms_limit} ms</p>

                <b>Rating:</b>
                <p>{props.rating}*</p>
            </div>
        </div>
    )
}

function statusToSymbol(status: number) {
    if (status === 0) return "*";
    else if (status === -2) return "•"
    else if (status === -1) return "C";
    else if (status === 1) return "X";
    else if (status === 2) return "T";
    else if (status === 3) return "!";
}

function statusToClass(status: number) {
    if (status === 0) return "tutoring-testcase-passed";
    else if (status === -2) return "tutoring-testcase-loading"
    else return "tutoring-testcase-fail";
}

function TestCaseRow(props: { results: TestCaseStatus[] }) {
    return (
        <div className="tutoring-testcase-row">
            {props.results.map((elem, index) =>
                <div className={"tutoring-testcase " + statusToClass(elem.status)}
                    key={index}>
                    <p>
                        {statusToSymbol(elem.status)}
                    </p>
                </div>
            )}
        </div>
    )
}

function SubmissionRow(props: { set: string, problem: string, id: number, index: number, results: TestCaseStatus[] }) {
    const user = useUser();

    const download = "/enss/problem_set/" + encodeURIComponent(props.set) +
        "/problem/" + encodeURIComponent(props.problem) + 
        "/submission/" + props.id;

    return (
        <tr className="tutoring-submission-row">
            <td>
                {/* TODO it is so stupid you need this to get around authentication headers, and the p button... */}
                <p className="tutoring-submission-index" onClick={async () => {
                    var response;
                    try {
                        response = await authentication_request(user, download, "GET")
                    } catch (err: any) {
                        console.log(err);
                        return;
                    }

                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = "";
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                }}>
                    {props.index}
                </p>
            </td>

            <td>
                <TestCaseRow results={props.results} />
            </td>
        </tr>
    )
}

function Submissions(props: { set: string, problem: string,  submissions: { [submission_id: number]: TestCaseStatus[] } }) {
    return (
        <table>
            <tbody>
                {Object.keys(props.submissions).map(elem => parseInt(elem)).sort((a, b) => b - a).map((elem, index) =>
                    <SubmissionRow
                        key={elem}
                        set={props.set}
                        problem={props.problem}
                        id={elem}
                        index={Object.keys(props.submissions).length - index}
                        results={props.submissions[elem]}
                    />
                )}
            </tbody>
        </table>
    )
}

function Submit(
    props: {
        problem_set: string,
        problem: string,
        user: UserState,
        close: Date | null
    }
) {
    let [error, setError] = useState("");

    const [type, setType] = useState("GNU G++20");
    const [file, setFile] = useState<File | null>(null);

    const [testCases, setTestCases] = useState<{ [submission_id: number]: TestCaseStatus[] }>({});

    const fileInputRef = useRef<HTMLInputElement>(null);

    // submissions
    useWorker(
        async () => {
            if (props.user[0]) {
                try {
                    const url = "/enss/results?" +
                        ("problem=" + encodeURIComponent(props.problem))  +
                        ("&user=" + encodeURIComponent(props.user[0].id.toString()));

                    const res = await authentication_request(props.user, url, "GET");
                    const json = await res.json();
                    if (!json.problem_sets[props.problem_set]) {
                        return;
                    }
                    const submissions = json.problem_sets[props.problem_set][props.problem][props.user[0].id];
                    setTestCases(submissions);
                } catch (err: any) {
                    console.log(err);
                }
            }
        }
    )

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setError("");
            setFile(e.target.files[0]);
        }
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (!file) {
                setError('Please select a file.');
                return;
            }
            else if (file.size > MAX_FILE_SIZE) {
                setError('File too large.');
                return;
            }
            setError("");

            const formData = new FormData();
            formData.append('language', type);
            formData.append('file', file);

            setFile(null);
            fileInputRef.current!.value = "";

            let res = await authentication_request(
                props.user,
                "/enss/problem_set/" + props.problem_set + "/problem/" + props.problem + "/submission/",
                "POST",
                formData,
                null
            );

            const id = (await res.json()).id
            setTestCases({ [id]: [], ...testCases });

            var refreshIntervalId: NodeJS.Timer;
            function requery() {
                if (props.user[0]) {
                    authentication_request(props.user, "/enss/results?submission=" + encodeURIComponent(id), "GET")
                        .then(res => {
                            return res.json();
                        })
                        .then(json => {
                            // it may not exist if it's currently length zero (based on the way stuff works on backend)
                            // generally because other submission is happening right now, if so just wait
                            if (!json.problem_sets[props.problem_set]) {
                                return;
                            }
                            const submissions = json.problem_sets[props.problem_set][props.problem][props.user[0]!.id];
                            setTestCases(prevTestCases => ({
                                ...prevTestCases,
                                [id]: submissions[id]
                              }));

                            if (Object.values(submissions[id]).every(elem => (elem as TestCaseStatus).status !== LOADING_STATUS)) {
                                clearInterval(refreshIntervalId);
                            }
                        })
                        .catch(err => {
                            clearInterval(refreshIntervalId);
                            console.log(err);
                        });
                }
                else {
                    clearInterval(refreshIntervalId);
                }
            }
            refreshIntervalId = setInterval(requery, 5000);
            setTimeout(requery, 1000);

        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div id="tutoring-submission" onSubmit={submit}>
            
            {props.user[0] && (props.close === null || props.close > new Date()) &&
                <form>
                    <div className="tutoring-submission-inputs">
                        <label htmlFor="tutoring-submission-language">Language:</label>
                        <select title="language" id="tutoring-submission-language" onChange={(event) => {
                            setType(event.target.value);
                        }}>
                            <option value="GNU G++20">GNU G++20</option>
                            <option value="Java 17">Java 17</option>
                            <option value="Python 3.11">Python 3.11</option>
                        </select>
                        <label htmlFor="tutoring-submission-file">File:</label>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} id="tutoring-submission-file" />
                    </div>

                {error &&
                    <p className="tutoring-submission-error">
                        {error}
                    </p>
                }

                    <button type="submit" className="ui-button-secondary ui-light-capsule tutoring-submit">Submit</button>

                    <hr />
                </form>
            }

            {!props.user[0] &&
                <p className="tutoring-submission-close">*Log in to submit*</p>
            }
            
            {props.user[0] && props.close !== null && props.close < new Date() &&
                <p className="tutoring-submission-close">*Submissions closed*</p>
            }

            {type === "Java 17" &&
                <p className="tutoring-submission-close"> Java submissions must be <br/> named main.java (case sensitive)! </p>
            }

            <Submissions 
                set={props.problem_set}
                problem={props.problem}
                submissions={testCases} 
                />
        </div>
    )
}

function ratingToRank(rating: number) {
    if (rating < 200) return "bronze";
    if (rating < 300) return "silver";
    if (rating < 400) return "gold";
    return "plat";
}

function List(props: { labels: string[], to: string[], rating?: number[], results?: { [name: string]: TestCaseStatus[] } }) {
    return (
        <table className="tutoring-list">
            <tbody>
                {props.labels.map((elem, index) =>
                    <tr key={elem}>
                        <td className="tutoring-list-label">
                            <Link key={elem} to={props.to[index]}>
                                {elem}
                            </Link>
                        </td>

                        <td className="tutoring-list-test-cases">
                            {props.results && props.results[elem] && TestCaseRow({ results: props.results[elem] })}
                        </td>

                        {
                            props.rating &&
                            <td className={"tutoring-rating tutoring-rating-" + ratingToRank(props.rating[index])}>
                                {props.rating[index]}*
                            </td>
                        }
                    </tr>
                )}
            </tbody>
        </table>
    )
}

export function SingleProblem() {
    const { problem_set, problem } = useParams();

    const user = useUser();
    const [problemData, setProblemData] = useState<{
        rating: number,
        submission_close: Date | null,
        kb_limit: number,
        ms_limit: number,
        content: string
    } | null>(null);

    const [error, setError] = useState("");

    // content
    useWorker(
        async () => {
            try {
                const res = await request("/enss/problem_set/" + problem_set + "/problem/" + problem);
                if (res.ok) {
                    const json = await res.json();
                    setProblemData(json);
                }
            } catch (err: any) {
                console.log(err);
                setError(err.message);
            }
        }
    )

    // submissions

    return (
        <StandardTemplate active='Tutoring' useStreaks={false} disableDots>

            {error && <p>{error}</p>}
            {!error &&
                <div className="tutoring-problem">

                    <Markdown markdown={problemData?.content || ""}>
                        {(header, mdown) => {
                            return (
                                <div className="tutoring-problem-main">
                                    {problemData &&
                                        <ProblemConfig
                                            name={problem!}
                                            set={problem_set!}
                                            rating={problemData.rating}
                                            kb_limit={problemData!.kb_limit}
                                            ms_limit={problemData!.ms_limit}
                                            closes={problemData!.submission_close}
                                        />
                                    }
                                    <div className="tutoring-md">
                                        {mdown}
                                    </div>
                                </div>
                            )
                        }}
                    </Markdown>

                    <Submit
                        problem_set={problem_set!}
                        problem={problem!}
                        user={user}
                        close={problemData?.submission_close ?? null}
                    />
                </div>
            }
        </StandardTemplate>
    )
}

export function ProblemSet() {
    const { problem_set } = useParams();

    const [problems, setProblems] = useState<string[]>([]);
    const [ratings, setRatings] = useState<number[]>([]);
    const [testCases, setTestCases] = useState<{ [name: string]: TestCaseStatus[] }>({});
    const user = useUser();

    // problems
    useWorker(
        async () => {
            try {
                const res = await request("/enss/problem_set/" + problem_set + "/problems");
                const json = await res.json();
                setProblems(json.map((elem: any) => elem.name));
                setRatings(json.map((elem: any) => elem.rating));
            } catch (err: any) {
                console.log(err);
            }
        }
    )

    // test cases
    useWorker(
        async () => {
            if (user[0]) {
                try {
                    const res = await authentication_request(user, "/enss/problem_set/" + problem_set + "/last_results", "GET");
                    const json = (await res.json()).results;

                    const result = Object.keys(json).reduce((result: any, name: string) => {
                        result[name] = json[name].tests;
                        return result;
                    }, {});
                    setTestCases(result);
                } catch (err: any) {
                    console.log(err);
                }
            }
        }
    )

    return (
        <StandardTemplate active='Tutoring' useStreaks={false} disableDots>
            <div className="tutoring-header">
                <h1>{problem_set}</h1>
                <Separator />
            </div>

            <List
                labels={problems}
                to={problems.map(elem => "problem/" + elem)}
                results={testCases}
                rating={ratings}
            />
        </StandardTemplate>
    )
}

export function ProblemSetList() {
    const [problemSets, setProblemSets] = useState<string[]>([]);

    useWorker(
        async () => {
            try {
                const res = await request("/enss/problem_sets");
                const json = await res.json(); // [{name: }]
                setProblemSets(json.map((elem: any) => elem.name));
            } catch (err: any) {
                console.log(err);
            }
        }
    )

    return (
        <StandardTemplate active='Tutoring' useStreaks={false} disableDots>
            <div className="tutoring-header">
                <h1>Problem Sets</h1>
                <Separator />
            </div>

            <List labels={problemSets} to={problemSets.map(elem => "problem_set/" + elem)} />
        </StandardTemplate>
    )
}

type ResultsQuery = {
    [problem_set: string] : {
        [problem: string]: {
            [user: number]: {
                [submission: number]: TestCaseStatus[]
            }
        }
    }
}


function UserResults(props: { problem_set: string, problem: string, user: number, results: ResultsQuery }) {
    return (
        <div className="tutoring-results-user">
            <h4>{props.user}</h4>

            <Submissions
                set={props.problem_set}
                problem={props.problem}
                submissions={props.results[props.problem_set][props.problem][props.user]}
            />
        </div>
    )
}

function ProblemResults(props: { problem_set: string, problem: string, results: ResultsQuery }) {

    return (
        <div className="tutoring-results-problem">
            <h3>{props.problem}</h3>

            {Object.keys(props.results[props.problem_set][props.problem]).map(user =>
                <UserResults
                    key={user}
                    problem_set={props.problem_set}
                    problem={props.problem}
                    user={parseInt(user)}
                    results={props.results}
                />
            )}
        </div>
    )
}

function ProblemSetResults(props: { problem_set: string, results: ResultsQuery }) {
    return (
        <div className="tutoring-results-problem-set">

            <h2>{props.problem_set}</h2>

            {Object.keys(props.results[props.problem_set]).map(problem =>
                <ProblemResults
                    key={problem}
                    problem_set={props.problem_set}
                    problem={problem}
                    results={props.results}
                />
            )}

        </div>
    )
}

export function Results() {
    const [problemSet, setProblemSet] = useState("");
    const [problem, setProblem] = useState("");
    const [user, setUser] = useState<number | null>();

    const realUser = useUser();

    const [map, setMap] = useState<ResultsQuery>({});

    async function query(event: React.FormEvent) {
        event.preventDefault();

        console.log("Called");

        try {
            const url =  "/enss/results?" +
                (problemSet ? "&problem_set=" + encodeURIComponent(problemSet) : "") + 
                (problem ? "&problem=" + encodeURIComponent(problem)  : "") +
                (user ? "&user=" + encodeURIComponent(user.toString()) : "");

            const res = await authentication_request(realUser, url, "GET");
            setMap((await res.json()).problem_sets);
        }
        catch (err: any) {
            console.log(err);
        }
    }

    return (
        <StandardTemplate active='Tutoring' useStreaks={false} disableDots>
            <h1>Results</h1>

            <form id="tutoring-results" className="window-background" onSubmit={query}>
                <label htmlFor="tutoring-results-problem-set">Problem Set:</label>
                <input type="text" id="tutoring-results-problem-set" onChange={(event) => {
                    setProblemSet(event.target.value);
                }} />

                <label htmlFor="tutoring-results-problem">Problem:</label>
                <input type="text" id="tutoring-results-problem" onChange={(event) => {
                    setProblem(event.target.value);
                }} />

                <label htmlFor="tutoring-results-user">User:</label>
                <input type="text" id="tutoring-results-user" value={user || ""} onChange={(event) => {
                    if (event.target.value === "") setUser(null);
                    else setUser(parseInt(event.target.value));
                }} />

                <input type="submit" value="Go" className="ui-light-capsule ui-button-primary tutoring-submit" />
            </form>

            <div id="tutoring-results-table">
                {Object.keys(map).map(problem_set =>
                    <ProblemSetResults
                        key={problem_set}
                        problem_set={problem_set}
                        results={map}
                        />
                )}
                {Object.keys(map).length === 0 &&
                    <p>No results found</p>
                }
            </div>
        </StandardTemplate>
    )
}