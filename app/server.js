'use strict';

const fetch = require('node-fetch');
const express = require('express');
const fs = require('fs');
const template = fs.readFileSync('/app/index.html');
const mustache = require('mustache');
const moment = require('moment');

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
  const endDate = moment(DEADLINES[milestone].end);
  const today = moment().format('YYYYMMDD');
  const allIssues = [];
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

app.get('/milestone/:milestone', (req, res) => {
  if ((projects.gitlab && projects.gitlab.length > 0) || (projects.github && projects.github.length > 0)) {
    const milestone = req.params.milestone;

    let onlyUser = null;
    if (req.query.user) {
      onlyUser = req.query.user;
    }

    let allIssues = initializeAllIssues(milestone);
    /*
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
                        if (issue.state === 'opened') {
                          if (!(people[person])) {
                            people[person] = 1;
                          } else {
                            people[person] += 1;
                          }
                        }
                      }
                      if (onlyUser) {
                        if (person && onlyUser === person) {
                          if (issue.state === 'opened') {
                            issues.push(issue);
                          }
                          allIssues = addIssue(allIssues, issue);
                        }
                      } else {
                        if (issue.state === 'opened') {
                          issues.push(issue);
                        }
                        allIssues = addIssue(allIssues, issue);
                      }
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
          const daysLeft = Math.floor((deadline.getTime() - (new Date()).getTime())/ (24 * 60 * 60 * 1000));
          const runRate = Math.ceil(totalTasks/daysLeft);

          let expanded = '';
          let title = milestone;
          if (onlyUser) {
            expanded = ' in';
            title = onlyUser + ' | ' + title;
          }

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
