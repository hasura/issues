'use strict';

/*
 * Issue dependency
 * Possible formats: needs #34 (same repo)
 *                   needs ##hasura/raven:37 (will try to search for project across vendors)
 *                   needs ##github:hasura/raven:37 (same vendor)
 * regex:
 * needs\s[#\d+])
 * dependent issues: {
 *   vendor:group/project#n: {
 *      state: '',
 *      closedDate: '',
 *      owner: '',
 *      url: '',
 *      blocking: [
 *        {title, url},
 *        {title, url},
 *      ]
 *   }
 * }
 */

/*
 * Issue graph
 * -----------
 * allIssues = {
 *   "2016-06-08": {
 *     open: 10,
 *     closed: 2
 *   },
 *   "2016-06-09": {
 *     open: 11,
 *     closed: 5
 *   }
 * }
 */


const fetch = require('node-fetch');
const express = require('express');
const fs = require('fs');
const template = fs.readFileSync('/app/index.html');
const mustache = require('mustache');
const moment = require('moment');

const needsRegex = /needs\s+(#\d+|github:[\w-]+\/[\w-]+#\d+|gitlab:[\w-]+\/[\w-]+#\d+)/gi;
const app = express();
const GITHUB = process.env.GITHUB;
const GITLAB = process.env.GITLAB;
const DEADLINES = JSON.parse(process.env.DEADLINES);
const USERS = JSON.parse(process.env.USERS);

// Perform some basic validation on configuration
if (!(process.env.PROJECTS)) {
  throw 'ENV var PROJECTS expected, but not found';
}
const projects = JSON.parse(process.env.PROJECTS)
if (projects.github && !GITHUB) {
  throw 'Need GITHUB env var for processing github projects';
}
if (projects.gitlab && !GITLAB) {
  throw 'Need GITLAB env var for processing gitlab projects';
}

app.use(express.static('/app/static'));

const issueCompare = (a, b) => {
  if (a.noIssues < b.noIssues) {
    return 1;
  }
  if (a.noIssues > b.noIssues) {
    return -1;
  }
  return 0;
};

const addIssue = (allIssues, issue) => {
  const opened = moment(issue.created_at).format('YYYYMMDD');

  let cdate = null;
  let closed = null;
  if (issue.closed_at) {
    cdate = issue.closed_at;
  } else if (issue.updated_at && issue.state === 'closed') {
    cdate = issue.updated_at;
  }
  if (cdate) {
    closed = moment(cdate).format('YYYYMMDD');
  }
  
  const today = moment().format('YYYYMMDD');
  const allIssues_ = allIssues.map((ai) => {
    if (opened <= ai.date) {
      ai.open += 1;
    }
    if (ai.date <= today) {
      if (closed && (closed <= ai.date)) {
        ai.closed += 1;
      }
    }
    return ai;
  });

  return allIssues_;
};

const initializeAllIssues = (milestone) => {
  const startDate = moment(DEADLINES[milestone].start);
  const endDate = moment(DEADLINES[milestone].end).add(1, 'days');
  const today = moment().format('YYYYMMDD');
  const allIssues = [];
  if (startDate.unix() > endDate.unix()) {
    throw ('Start date cannot be greater than end date');
  }
  let current = startDate;
  do {
    if (current.format('YYYYMMDD') <= today) {
      allIssues.push({date: current.format('YYYYMMDD'), open: 0, closed: 0});
    } else {
      allIssues.push({date: current.format('YYYYMMDD'), open: 0});
    }
    current = current.add(1, 'days');
  } while (current.unix() !== endDate.unix());
  return allIssues;
};

const addBlockers = (issueName, issueUrl, issueOpen, issueBody, issue, allDepIssues) => {
  needsRegex.lastIndex = 0;
  let match = needsRegex.exec(issueBody);
  while (match !== null) {
    let blocker = match[1];
    if (blocker !== '') {

      // #13 => same project issue
      if (blocker.match(/^#\d+/)) {
        blocker = issueName.split('#')[0] + blocker;
      } // else blocker is gitlab:group/project#no

      if (!(allDepIssues[blocker])) {
        allDepIssues[blocker] = {
          blockingOpen: [],
          blockingClosed: [],
        };
      }

      if (issueOpen) {
        // allDepIssues[blocker].blockingOpen = (allDepIssues[blocker].blockingOpen) ? allDepIssues[blocker].blockingOpen : [];
        allDepIssues[blocker].blockingOpen.push({
          title: issue.title,
          url: issueUrl,
          name: issueName
        })
      } else {
        // allDepIssues[blocker].blockingClosed = (allDepIssues[blocker].blockingClosed) ? allDepIssues[blocker].blockingClosed : [];
        allDepIssues[blocker].blockingClosed.push({
          title: issue.title,
          url: issueUrl,
          name: issueName
        })
      }
    }
    match = needsRegex.exec(issueBody);
  }
  return allDepIssues;
};

app.get('/milestone/:milestone', (req, res) => {
  if ((projects.gitlab && projects.gitlab.length > 0) || (projects.github && projects.github.length > 0)) {
    const milestone = req.params.milestone;

    let onlyUser = null;
    if (req.query.user) {
      onlyUser = req.query.user;
    }

    let allIssues = initializeAllIssues(milestone);
    let allDepIssues = {};

    /* ********* GITLAB **************** */
    console.log("Fetching from gitlab: " + JSON.stringify(projects.gitlab));
    const people = {};
    const gitlabIssues = [];
    let totalGitlab = 0;
    const gitlabPromises = projects.gitlab.map((p, i) => {
      const promise = new Promise((resolve, reject) => {
        fetch(`https://gitlab.com/api/v3/projects/${p.replace('/','%2F')}/issues?milestone=${milestone}`,
        // fetch('http://192.168.99.100:7031/gitlab',
          { headers: {
            'Content-Type': 'application/json',
            'PRIVATE-TOKEN': `${GITLAB}`
          }}).then(
            (response) => {
              if (response.status >= 200 && response.status < 300) {
                response.text().then((data) => {
                  try {
                    const results = JSON.parse(data);
                    const milestoneId = (results[0] && results[0].milestone) ? results[0].milestone.iid : null;
                    const issues = [];

                    results.map((issue) => {
                      let person = null;
                      if (issue.assignee) {
                        person = USERS[issue.assignee.username];
                        if (issue.state !== 'closed') {
                          if (!(people[person])) {
                            people[person] = 1;
                          } else {
                            people[person] += 1;
                          }
                        }
                      }
                      if (onlyUser) {
                        if (person && onlyUser === person) {
                          if (issue.state !== 'closed') {
                            issues.push(issue);
                          }
                          allIssues = addIssue(allIssues, issue);
                        }
                      } else {
                        if (issue.state !== 'closed') {
                          issues.push(issue);
                        }
                        allIssues = addIssue(allIssues, issue);
                      }
                      // Add to allDepIssues
                      const issueName = 'gitlab:' + p + '#' + issue.iid;
                      const issueUrl = 'https://gitlab.com/'+p+'/issues/'+issue.iid;
                      const issueOpen = issue.state !== 'closed';

                      // Add to the blocker data structure
                      if (!(allDepIssues[issueName])) {
                        allDepIssues[issueName] = {
                          blockingClosed: [],
                          blockingOpen: []
                        };
                      }
                      allDepIssues[issueName].title = issue.title;
                      allDepIssues[issueName].url = issueUrl;
                      allDepIssues[issueName].closed = (issueOpen ? false : true);
                      allDepIssues[issueName].closed_at = (issueOpen ? null : issue.updated_at);

                      // Add blocking issues for this issue
                      allDepIssues = addBlockers(issueName, issueUrl, issueOpen, issue.description, issue, allDepIssues);
                    });

                    gitlabIssues.push({project: p, projectNo: i, noIssues: issues.length, issues: issues, milestoneId: milestoneId});
                    totalGitlab += issues.length;

                    resolve();
                  } catch (err) {
                    console.log(err.stack);
                    reject(err.toString());
                  }
                });
                return;
              }
              reject(p + ':: ' + response.status.toString() + ': ' + response.statusText);
            },
            (error) => {
              reject(p + ':: failed to fetch from gitlab: ' + error.message);
            }
          );
      });
      return promise;
    });

    /* ********* GITHUB **************** */
    console.log("Fetching from github: " + JSON.stringify(projects.github));
    const githubIssues = [];
    let totalGithub = 0;
    const githubPromises = projects.github.map((p, i) => {
      const projectName = p.name;
      const milestoneId = p.milestones[milestone];
      const promise = new Promise((resolve, reject) => {
        fetch(`https://api.github.com/repos/${projectName}/issues?milestone=${milestoneId}&state=open`,
        // fetch('http://192.168.99.100:7031/github',
          { headers: {
            'Content-Type': 'application/json',
            'Authorization': `token ${GITHUB}`
          }}).then(
            (response) => {
              if (response.status >= 200 && response.status < 300) {
                response.text().then((data) => {
                  try {
                    const results = JSON.parse(data);
                    const milestoneUrl = (results[0] && results[0].milestone) ? results[0].milestone.html_url : null;
                    const issues = [];
                    results.map((issue) => {
                      let person = null;
                      if (issue.assignee) {
                        person = USERS[issue.assignee.login];
                        if (issue.state === 'open') {
                          if (!(people[person])) {
                            people[person] = 1;
                          } else {
                            people[person] += 1;
                          }
                        }
                      }

                      if (onlyUser) {
                        if (person && onlyUser === person) {
                          if (issue.state === 'open') {
                            issues.push(issue);
                          }
                          allIssues = addIssue(allIssues, issue);
                        }
                      } else {
                        if (issue.state === 'open') {
                          issues.push(issue);
                        }
                        allIssues = addIssue(allIssues, issue);
                      }
                      // Add to allDepIssues
                      const issueName = 'github:' + projectName + '#' + issue.number;
                      const issueUrl = issue.html_url
                      const issueOpen = issue.state === 'open';

                      // Add to the blocker data structure
                      if (!(allDepIssues[issueName])) {
                        allDepIssues[issueName] = {
                          blockingOpen: [],
                          blockingClosed: []
                        };
                      }
                      allDepIssues[issueName].title = issue.title;
                      allDepIssues[issueName].url = issueUrl;
                      allDepIssues[issueName].closed = (issueOpen ? false : true);
                      allDepIssues[issueName].closed_at = (issueOpen ? null : issue.updated_at);

                      // Add blocking issues for this issue
                      allDepIssues = addBlockers(issueName, issueUrl, issueOpen, issue.body, issue, allDepIssues);
                    });

                    githubIssues.push({
                      project: projectName,
                      projectNo: i,
                      noIssues: issues.length,
                      issues: issues,
                      milestoneUrl: milestoneUrl});
                    totalGithub += issues.length;
                    resolve();
                  } catch (err) {
                    console.log(err.stack);
                    reject(err.toString());
                  }
                });
                return;
              }
              reject(p + ':: ' + response.status.toString() + ': ' + response.statusText);
            },
            (error) => {
              reject(p + ':: failed to fetch from github: ' + error.message);
            }
          );
      });
      return promise;
    });


    Promise.all(gitlabPromises.concat(githubPromises)).then(
      () => {
        // Assemble stats
        try {

          // Sort according to number of issues
          gitlabIssues.sort(issueCompare);
          githubIssues.sort(issueCompare);

          // Compile per person list
          console.log('compiling template');
          const people2 = [];
          let assignedTasks = 0;
          const totalTasks = totalGitlab + totalGithub;
          for (const k in people) {
            if (onlyUser) {
              if (onlyUser === k) {
                people2.push({name: k, number: people[k], width: (people[k]/totalTasks*100)});
                assignedTasks += people[k];
              }
            } else {
              people2.push({name: k, number: people[k], width: (people[k]/totalTasks*100)});
              assignedTasks += people[k];
            }
          }
          const unassignedTasks = totalTasks - assignedTasks;
          const unassignedWidth = unassignedTasks/totalTasks * 100;

          const deadline = new Date(DEADLINES[milestone].end);
          const daysLeft = Math.floor((deadline.getTime() + 24*60*60*1000 - (new Date()).getTime())/ (24 * 60 * 60 * 1000));
          const runRate = Math.ceil(totalTasks/daysLeft);

          let expanded = '';
          let title = milestone;
          if (onlyUser) {
            expanded = ' in';
            title = onlyUser + ' | ' + title;
          }

          const _allDepIssues = Object.keys(allDepIssues).map((k, i) => {
            return {name: k, data: allDepIssues[k], index: i};
          }).filter(b => ((b.data.blockingOpen.length > 0) || (b.data.blockingClosed.length > 0)));

          const output = mustache.render(template.toString(), {
            deadline: deadline.toDateString().toString().substr(0,11),
            totalTasks: totalTasks,
            daysLeft: daysLeft,
            runRate: runRate,
            unassignedTasks: unassignedTasks,
            unassignedWidth: unassignedWidth,
            gitlab: gitlabIssues,
            totalGitlab: totalGitlab,
            github: githubIssues,
            totalGithub: totalGithub,
            people: people2,
            expanded: expanded,
            title: title,
            milestone: milestone,
            blockers: _allDepIssues,
            totalBlockers: _allDepIssues.length,
            allIssues: JSON.stringify(allIssues)
          });
          res.send(output);
        }
        catch (err) {
          console.log(err.stack);
          res.send(err);
        }

      },
      (error) => {
        res.send(error);
      });

  } else {
    res.send('No projects specified');
  }
});

app.listen(80, '0.0.0.0');
console.log("Server listening on port 80");
