const express = require('express');
const router = express.Router();
const { cacheData } = require('../utils/excel');

const { sheets, cachedData } = cacheData();

router.get('/periods', (req, res) => {
  const periods = new Set();
  for (const sheet of sheets) {
    for (const [period] of cachedData[sheet] || []) {
      periods.add(period);
    }
  }
  res.json([...periods].sort());
});

router.get('/dashboard/general/:period', (req, res) => {
  const period = req.params.period;
  let totalViews = 0, totalSI = 0, totalER = 0, postCount = 0;

  for (const sheet of sheets) {
    for (const [p, posts] of cachedData[sheet] || []) {
      if (p === period) {
        for (const post of posts) {
          totalViews += post['Просмотры'];
          totalSI += post['СИ'];
          totalER += post['ЕР'];
          postCount += 1;
        }
      }
    }
  }

  res.json({
    views: totalViews,
    si: totalSI,
    er: postCount ? totalER / postCount : 0,
    posts: postCount,
  });
});

router.get('/dashboard/project/:sheet/:period', (req, res) => {
  const { sheet, period } = req.params;
  let totalViews = 0, totalSI = 0, totalER = 0, postCount = 0;

  for (const [p, posts] of cachedData[sheet] || []) {
    if (p === period) {
      for (const post of posts) {
        totalViews += post['Просмотры'];
        totalSI += post['СИ'];
        totalER += post['ЕР'];
        postCount += 1;
      }
      break;
    }
  }

  res.json({
    views: totalViews,
    si: totalSI,
    er: postCount ? totalER / postCount : 0,
    posts: postCount,
  });
});

module.exports = router;