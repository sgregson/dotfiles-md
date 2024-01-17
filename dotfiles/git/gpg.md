https://docs.github.com/en/authentication/managing-commit-signature-verification/checking-for-existing-gpg-keys

Basically download the binary from https://www.gnupg.org/download/ and then import your private key onto your new machine `gpg --import private.key`.

Then Tell git about it with:

```sh
git config --global --unset gpg.format
gpg --list-secret-keys --keyid-format=long
git config --global user.signingkey #############
```

Remember to kill gpg-agent if you change the pinentry program (with `gpgconf --kill gpg-agent`).

```ini $HOME/.gnupg/gpg-agent.conf action=symlink title=gpg-pinentry
pinentry-program /opt/homebrew/bin/pinentry-mac
```

From [pinentry-touchid](https://github.com/jorgelbg/pinentry-touchid) I don't want to save my passphrase in keychain:

```sh action=run title=disable-save-gpg-to-keychain
defaults write org.gpgtools.common DisableKeychain -bool yes
```
