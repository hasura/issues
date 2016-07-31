import moment from 'moment';

const initializeChartIssues = () => {
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

const addToChartIssues = (issue, chartIssues, onlyUser) => {
  if (!issue.isOpen) {
    return chartIssues;
  }

  if (onlyUser) {
    if (issue.assignee === onlyUser) {
      return _addToChartIssues(issue, chartIssues);
    }
    return chartIssues;
  }

  return _addToChartIssues(issue, chartIssues);
};

const _addToChartIssues = (issue, chartIssues) => {
  const opened = moment(issue.created_at).format('YYYYMMDD');

  let closed;
  if (issue.closed_at) {
    closed = moment(issue.closed_at).format('YYYYMMDD');
  }

  const today = moment().format('YYYYMMDD');

  const _chartIssues = chartIssues.map((ai) => {
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

  return _chartIssues;
};

export {initializeChartIssues};
