const mkIssue = () => ({
  title: null,
  milestone: null,
  createdAt: null,
  isOpen: null,
  closedAt: null,
  description: null,
  assignee: null
});

const mkFromGitlabIssue = (issue, USERS) => {
  const _i = mkIssue();

  _i.title = issue.title;
  _i.description = issue.description;
  _i.isOpen = !(issue.state === 'closed');
  _i.createdAt = issue.created_at;
  _i.closedAt = (!_i.isOpen) ? issue.updated_at : null; // Assumes that last update was the closing of the issue
  _i.assignee = (issue.assignee && (issue.assignee.username in USERS)) ? USERS[issue.assignee.username] : 'unassigned';

  return _i;
};

const mkFromGithubIssue = (issue, USERS) => {
  const _i = mkIssue();

  _i.title = issue.title;
  _i.description = issue.description;
  _i.isOpen = !(issue.state === 'open');
  _i.createdAt = issue.created_at;
  _i.closedAt = issue.closed_at;
  _i.assignee = (issue.assignee && (issue.assignee.login in USERS)) ? USERS[issue.assignee.login] : 'unassigned';

  return _i;
};

const mkMilestone = () => ({
  url: null,
  name: null
});

const mkFromGithubMilestone = (milestoneIssues, milestone) => {
  const _m = mkMilestone();

  const mi = milestoneIssues;
  _m.url = (mi[0] && mi[0].milestone) ? mi[0].milestone.html_url : null;
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
