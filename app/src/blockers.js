const needsRegex = /needs\s+(#\d+|github:[\w-]+\/[\w-]+#\d+|gitlab:[\w-]+\/[\w-]+#\d+)/gi;

const addBlockers = (issueName, issue, allDepIssues) => {
  needsRegex.lastIndex = 0;
  let match = needsRegex.exec(issue.description);

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

      if (issue.isOpen) {
        allDepIssues[blocker].blockingOpen.push({
          title: issue.title,
          url: issue.url,
          name: issueName
        });
      } else {
        allDepIssues[blocker].blockingClosed.push({
          title: issue.title,
          url: issue.url,
          name: issueName
        });
      }
    }
    match = needsRegex.exec(issue.description);
  }
  return allDepIssues;
};

const updateAllBlockers = (issue, allDepIssues, projectName, provider) => {
  // Add to allDepIssues
  const issueName = provider + ':' + projectName + '#' + issue.iid;

  // Add to the blocker data structure
  if (!(allDepIssues[issueName])) {
    allDepIssues[issueName] = {
      blockingClosed: [],
      blockingOpen: []
    };
  }
  allDepIssues[issueName].title = issue.title;
  allDepIssues[issueName].url = issue.url;
  allDepIssues[issueName].closed = (!issue.open);
  allDepIssues[issueName].closed_at = issue.closedAt;
  allDepIssues[issueName]._issue = issue;

  // Add blocking issues for this issue
  allDepIssues = addBlockers(issueName, issue, allDepIssues);
  return allDepIssues;
};

const createBlockerIssues = (allDepIssues, onlyUser) => {
  const _allDepIssues = Object.keys(allDepIssues).map((k, i) => ({
    name: k,
    data: allDepIssues[k],
    index: i
  })).filter(b => {
    if (b.closed) {
      return false;
    }
    if (onlyUser && !(b._issue.assignee === onlyUser)) {
      return false;
    }
    if ((b.data.blockingOpen.length === 0) &&
      (b.data.blockingClosed.length === 0)) {
      return false;
    }
    return true;
  });
  return _allDepIssues;
};

export {updateAllBlockers, createBlockerIssues};
