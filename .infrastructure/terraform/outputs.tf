output "droplet_ip" {
  value = digitalocean_droplet.this.ipv4_address
}
output "volume_name" {
  value = digitalocean_volume.this.name
}