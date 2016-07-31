/* eslint-disable no-param-reassign */

const addToIssues = (issue, issues, onlyUser) => {
  if (!issue.isOpen) { // Discard if issue is closed
    return issues;
  }

  if (onlyUser) {
    if (issue.assignee === onlyUser) {
      issues.push(issue);
      return issues;
    }
    return issues;
  }

  issues.push(issue);
  return issues;
};

const countPerPerson = (issue, people) => {
  if (!issue.isOpen) {
    return people;
  }

  if (issue.assignee in people) {
    people[issue.assignee] += 1;
  } else {
    people[issue.assignee] = 1;
  }
  return people;
};

const issueCompare = (a, b) => {
  if (a.noIssues < b.noIssues) {
    return 1;
  }
  if (a.noIssues > b.noIssues) {
    return -1;
  }
  return 0;
};

const createPersonLoadList = (people, totalTasks, onlyUser) => {
  const loadList = [];
  for (const k in people) { // eslint-disable-line no-restricted-syntax
    if (onlyUser) {
      if (onlyUser === k) {
        loadList.push({name: k, number: people[k], width: (100 * (people[k] / totalTasks))});
      }
    } else {
      loadList.push({name: k, number: people[k], width: (100 * (people[k] / totalTasks))});
    }
  }
  return loadList;
};

const getDaysLeft = (deadline) => {
  const dayMs = 24 * 60 * 60 * 1000;
  const timeLeft = (deadline.getTime() + dayMs) - (new Date()).getTime();
  return Math.floor(timeLeft / dayMs);
};

const createTitle = (projectName, milestone, onlyUser) => {
  if (onlyUser) {
    return projectName + ' - ' + onlyUser + ' - ' + milestone;
  }
  return projectName + ' - ' + milestone;
};

export {addToIssues, countPerPerson, issueCompare, createPersonLoadList, getDaysLeft, createTitle};
