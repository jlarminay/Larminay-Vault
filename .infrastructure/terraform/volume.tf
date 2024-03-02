# Create a new volume
resource "digitalocean_volume" "this" {
  name  = "${local.common_name}-volume"
  region = "tor1"
  size = 10 # size in gb
  initial_filesystem_type = "ext4"
}

resource "digitalocean_volume_attachment" "volume" {
  droplet_id = digitalocean_droplet.this.id
  volume_id  = digitalocean_volume.this.id
}

