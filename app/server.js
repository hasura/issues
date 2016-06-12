'use strict';

const fetch = require('node-fetch');
const express = require('express');
const fs = require('fs');
const template = fs.readFileSync('/app/index.html');
const mustache = require('mustache');

const app = express();
const GITHUB = process.env.GITHUB;
const GITLAB = process.env.GITLAB;

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

app.get('/milestone', (req, res) => {
  if ((projects.gitlab && projects.gitlab.length > 0) || (projects.github && projects.github.length > 0)) {
    console.log("Fetching from gitlab: " + JSON.stringify(projects.gitlab));

    const gitlabIssues = [];
    let totalGitlab = 0;
    const gitlabPromises = projects.gitlab.map((p, i) => {
      const promise = new Promise((resolve, reject) => {
        // fetch(`https://gitlab.com/api/v3/projects/${p.replace('/','%2F')}/issues?milestone=${req.query.gitlab}&state=opened`,
        fetch('http://192.168.99.100:7031/gitlab',
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
      const promise = new Promise((resolve, reject) => {
        // fetch(`https://api.github.com/repos/${p}/issues?milestone=${req.query.github}&state=open`,
        fetch('http://192.168.99.100:7031/github',
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
                    githubIssues.push({project: p, projectNo: i,
                      noIssues: results.length,
                      issues: results,
                      milestoneUrl: milestoneUrl});
                    totalGithub += results.length;
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
        const output = mustache.render(template.toString(), {
          gitlab: gitlabIssues,
          totalGitlab: totalGitlab,
          github: githubIssues,
          totalGithub: totalGithub,
          milestone: req.query.gitlab});
        res.send(output);
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
