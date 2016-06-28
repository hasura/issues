'use strict';

const fetch = require('node-fetch');
const express = require('express');
const fs = require('fs');
const template = fs.readFileSync('/app/index.html');
const mustache = require('mustache');

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

app.get('/milestone/:milestone', (req, res) => {
  if ((projects.gitlab && projects.gitlab.length > 0) || (projects.github && projects.github.length > 0)) {
    console.log("Fetching from gitlab: " + JSON.stringify(projects.gitlab));
    const milestone = req.params.milestone;
    const people = {};
    const gitlabIssues = [];
    let totalGitlab = 0;
    const gitlabPromises = projects.gitlab.map((p, i) => {
      const promise = new Promise((resolve, reject) => {
        fetch(`https://gitlab.com/api/v3/projects/${p.replace('/','%2F')}/issues?milestone=${milestone}&state=opened`,
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
                    gitlabIssues.push({project: p, projectNo: i, noIssues: results.length, issues: results, milestoneId: milestoneId});
                    totalGitlab += results.length;
                    results.map((issue) => {
                      if (issue.assignee) {
                        const person = USERS[issue.assignee.username];
                        if (!(people[person])) {
                          people[person] = 1;
                        } else {
                          people[person] += 1;
                        }
                      }
                    });
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
                    githubIssues.push({project: projectName, projectNo: i,
                      noIssues: results.length,
                      issues: results,
                      milestoneUrl: milestoneUrl});
                    totalGithub += results.length;
                    results.map((issue) => {
                      if (issue.assignee) {
                        const person = USERS[issue.assignee.login];
                        if (!(people[person])) {
                          people[person] = 1;
                        } else {
                          people[person] += 1;
                        }
                      }
                    });
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
        // Sort according to number of issues
        gitlabIssues.sort(issueCompare);
        githubIssues.sort(issueCompare);

        // Template this
        console.log('compiling template');
        const people2 = [];
        let assignedTasks = 0;
        for (const k in people) {
          people2.push({name: k, number: people[k]});
          assignedTasks += people[k];
        }


        // Assemble stats
        try {
          const deadline = new Date(DEADLINES[milestone]);
          const totalTasks = totalGitlab + totalGithub;
          const daysLeft = Math.floor((deadline.getTime() - (new Date()).getTime())/ (24 * 60 * 60 * 1000));
          const runRate = Math.ceil(totalTasks/daysLeft);
          const unassignedTasks = totalTasks - assignedTasks;

          const output = mustache.render(template.toString(), {
            deadline: deadline.toDateString().toString().substr(0,11),
            totalTasks: totalTasks,
            daysLeft: daysLeft,
            runRate: runRate,
            unassignedTasks: unassignedTasks,
            gitlab: gitlabIssues,
            totalGitlab: totalGitlab,
            github: githubIssues,
            totalGithub: totalGithub,
            people: people2,
            milestone: milestone});
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
