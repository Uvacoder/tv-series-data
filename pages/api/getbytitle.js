export default async (req, res) => {
  const searchParam = req.query.t;

  const url = [`http://omdbapi.com/?apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}&t=${searchParam}`];

  const response = await fetch(url);
  const tvSeries = await response.json();

  if (tvSeries.Error || tvSeries?.Type === 'movie') {
    return res.status(404).json({ error: 'Tv Series Not Found' });
  }

  const totalSeasons = tvSeries.totalSeasons;

  const rawSeasonsData = [];

  const seasonUrl = [];
  for (let i = 1; i <= totalSeasons; i++) {
    seasonUrl.push(`${url}&season=${i}`);
  }

  await Promise.all(
    seasonUrl.map(async (seasonUrl) => {
      const response = await fetch(seasonUrl);
      const result = await response.json();
      rawSeasonsData.push(result);
    })
  );

  function compare(a, b) {
    if (parseInt(a.Season) < parseInt(b.Season)) {
      return -1;
    }
    if (parseInt(a.Season) > parseInt(b.Season)) {
      return 1;
    }
    return 0;
  }
  rawSeasonsData.sort(compare);

  let counter = 1;
  rawSeasonsData.forEach((s) => {
    s.Episodes.forEach((e) => {
      e.episodeWithSeason = 'S' + s.Season + 'E' + e.Episode;
      e.episodeNumber = counter;
      counter++;
    });
  });

  return res.status(200).json({ info: tvSeries, seasonData: rawSeasonsData });
};