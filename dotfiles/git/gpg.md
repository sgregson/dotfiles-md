https://docs.github.com/en/authentication/managing-commit-signature-verification/checking-for-existing-gpg-keys

Basically download the binary from https://www.gnupg.org/download/ and then import your private key onto your new machine `gpg --import private.key`.

Then Tell git about it:

```sh
git config --global --unset gpg.format
gpg --list-secret-keys --keyid-format=long
git config --global user.signingkey #############
```

```ini $HOME/.gnupg/gpg-agent.conf action=build title=gpg-pinentry
pinentry-program $(which pinentry-mac)
```
