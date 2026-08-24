export type Credentials = {
  server: string;
  username: string;
  password: string;
};

export type Account = {
  user_info?: {
    auth?: number | string;
    status?: string;
    exp_date?: string;
    is_trial?: string;
    active_cons?: string;
    max_connections?: string;
    allowed_output_formats?: string[];
    message?: string;
  };
  server_info?: {
    url?: string;
    port?: string;
    https_port?: string;
    server_protocol?: string;
    timezone?: string;
  };
};

export type Category = {
  category_id: string;
  category_name: string;
  parent_id?: number;
};

export type LiveChannel = {
  stream_id: number;
  name: string;
  stream_icon?: string;
  epg_channel_id?: string;
  category_id?: string;
  tv_archive?: number;
  tv_archive_duration?: number;
};

export type VodItem = {
  stream_id: number;
  name: string;
  stream_icon?: string;
  category_id?: string;
  rating?: string;
  rating_5based?: number;
  container_extension?: string;
};

export type EpgItem = {
  id?: string;
  title?: string;
  description?: string;
  start?: string;
  end?: string;
  start_timestamp?: string;
  stop_timestamp?: string;
};

export type Section = "home" | "live" | "movies" | "search" | "favorites";

export type PlayerItem = {
  id: string;
  title: string;
  kind: "live" | "movie";
  url: string;
  image?: string;
  description?: string;
};