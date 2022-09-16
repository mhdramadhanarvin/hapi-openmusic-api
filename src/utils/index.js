const mapDBToModelAlbum = ({ id, name, year }) => ({
  id,
  name,
  year,
});

const mapDBToModelSong = ({ id, title, year, genre, performer }) => ({
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
  album_id,
}) => ({ id, title, year, performer, genre, duration, albumId: album_id });

module.exports = {
  mapDBToModelAlbum,
  mapDBToModelSong,
  mapAlbumWithRelatedSong,
  mapDBToModelSongDetail,
};
