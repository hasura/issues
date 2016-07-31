const mkIssue = () => ({
  iid: null,
  title: null,
  milestone: null,
  createdAt: null,
  isOpen: null,
  closedAt: null,
  description: null,
  assignee: null
});

const mkFromGitlabIssue = (issue, USERS, projectName) => {
  const _i = mkIssue();

  _i.iid = issue.iid;
  _i.title = issue.title;
  _i.description = issue.description;
  _i.isOpen = !(issue.state === 'closed');
  _i.createdAt = issue.created_at;
  _i.closedAt = (!_i.isOpen) ? issue.updated_at : null; // Assumes that last update was the closing of the issue
  _i.assignee = (issue.assignee && (issue.assignee.username in USERS)) ? USERS[issue.assignee.username] : 'unassigned';
  _i.labels = issue.labels.map(l => ({name: l}));
  _i.url = 'https://gitlab.com/' + projectName + '/issues/' + _i.iid;

  return _i;
};

const mkFromGithubIssue = (issue, USERS) => {
  const _i = mkIssue();

  _i.iid = issue.number;
  _i.title = issue.title;
  _i.description = issue.body;
  _i.isOpen = (issue.state === 'open');
  _i.createdAt = issue.created_at;
  _i.closedAt = issue.closed_at;
  _i.assignee = (issue.assignee && (issue.assignee.login in USERS)) ? USERS[issue.assignee.login] : 'unassigned';
  _i.labels = issue.labels.map(l => ({name: l.name}));
  _i.url = issue.html_url;

  return _i;
};

const mkMilestone = () => ({
  url: null,
  name: null
});

const mkFromGithubMilestone = (projectName, milestone, milestoneId) => {
  const _m = mkMilestone();

  _m.url = 'https://github.com/' + projectName + '/milestone/' + milestoneId;
  _m.name = milestone;

  return _m;
};

const mkFromGitlabMilestone = (milestoneIssues, milestone, projectName) => {
  const _m = mkMilestone();

  const mi = milestoneIssues;
  _m.name = milestone;

  if (mi.length === 0 || (!mi[0].milestone)) {
    _m.url = 'https://gitlab.com/' + projectName;
    return _m;
  }

  _m.url = 'https://gitlab.com/' + projectName + '/milestones/' + mi[0].milestone.iid.toString();
  return _m;
};

export {mkFromGitlabIssue, mkFromGithubIssue, mkFromGithubMilestone, mkFromGitlabMilestone};
