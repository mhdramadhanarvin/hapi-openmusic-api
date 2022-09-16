const mapDBToModelAlbum = ({ id, name, year }) => ({
  id,
  name,
  year,
});

const mapDBToModelSong = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
}) => ({
  id,
  title,
  performer,
});

const mapAlbumWithRelatedSong = ({ id, title, performer, songs }) => ({
  id,
  title,
  performer,
  songs,
});

const mapDBToModelSongDetail = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
}) => ({ id, title, year, genre, performer, duration, albumId });

module.exports = {
  mapDBToModelAlbum,
  mapDBToModelSong,
  mapAlbumWithRelatedSong,
  mapDBToModelSongDetail
};
