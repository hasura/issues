const mkIssue = () => {
  return {
    title: null,
    milestone: null,
    createdAt: null,
    isOpen: null,
    closedAt: null,
    description: null,
    assignee: null
  };
};

const mkFromGitlabIssue = (issue, USERS) => {
  const _i = mkIssue()

  _i.title = issue.title;
  _i.description = issue.description;
  _i.isOpen = (issue.state === 'closed') ? false : true;
  _i.createdAt = issue.created_at;
  _i.closedAt = (!_i.isOpen) ? issue.updated_at : null; // Assumes that last update was the closing of the issue
  _i.assignee = (issue.assignee.username in USERS) ? USERS[issue.assignee.username] : 'unassigned';

  return _i;
};

const mkFromGithubIssue = (issue, USERS) => {
  const _i = mkIssue()

  _i.title = issue.title;
  _i.description = issue.description;
  _i.isOpen = (issue.state === 'open') ? true : false;
  _i.createdAt = issue.created_at;
  _i.closedAt = issue.closed_at;
  _i.assignee = (issue.assignee.login in USERS) ? USERS[issue.assignee.login] : 'unassigned';

  return _i;
};

const mkMilestone = () => {
  return {
    url: null,
    name: null
  };
};

const mkFromGitlabMilestone = (milestoneIssues, milestone) => {
  const _m = mkMilestone();

  _m.url = (results[0] && results[0].milestone) ? results[0].milestone.html_url : null;
  _m.name = milestone;

  return _m;
};

// TODO
const mkFromGithubMilestone = (milestoneIssues, milestone) => {
  const _m = mkMilestone();

  _m.url = (results[0] && results[0].milestone) ? results[0].milestone.html_url : null;
  _m.name = milestone;

  return _m;
};

export {mkFromGitlabIssue, mkFromGithubIssue, mkFromGithubMilestone, mkFromGitlabMilestone};
