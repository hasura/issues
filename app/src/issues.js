const mkIssue = () => {
  return {
    title: null,
    milestone: null,
    created: null,
    comments: [],
    isOpen: null,
    closedDate: null,
    description: null,
    assignee: null
  };
};

const mkFromGitlabIssue = (issue) => {
  const _i = {...mkIssue(),
  };
};

export {mkFromGitlabIssue};
