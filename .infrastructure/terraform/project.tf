resource "digitalocean_project_resources" "this" {
  project = var.project_id
  resources = [
    digitalocean_droplet.this.urn,
    digitalocean_volume.this.urn
  ]
}