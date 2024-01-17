```ini $HOME/.ssh/config action=symlink title=ssh-config
Host dev-gcp
  HostName webphp-php8sgregson-dsm1.us-central1-a.c.wf-gcp-us-sds-prod.internal
  CanonicalizeHostname yes

Host *.wf-gcp-us-sds-prod.internal
  User sgregson_gcp_wayfair_com
  StrictHostKeyChecking no
  UserKnownHostsFile /dev/null
  # IdentityFile ~/.ssh/id_rsa
  # IdentitiesOnly yes
  # ForwardAgent yes
  # ServerAliveInterval 240


Host *
    IdentityAgent "~/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock"
```
