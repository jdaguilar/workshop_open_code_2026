# Installing Ollama models from a USB drive

The venue has slow internet, so don't `ollama pull` there. Pull the model once on a good connection, copy it to a
USB drive, and import it on each machine. Nothing is converted along the way: Ollama stores a model as a small
**manifest** plus **blobs** (the weights), and copying those files is enough.

`gemma4:e4b` is about **2,200 files** (8.8 GB, the largest is 5.6 GB), not one big file. Copying many small files to
and from a USB stick is slower than the size suggests, so time one full copy before the event.

Default model: `gemma4:e4b` (~9.5 GB). Use the same steps for `gemma4:e2b` or any other tag. Just change `TAG`.

## 0. What goes on the USB drive

| Item | Why |
|---|---|
| `ollama-models/` (made in step 2) | The model files |
| Ollama installers: `Ollama.dmg` (macOS), `OllamaSetup.exe` (Windows), `ollama-linux-amd64.tgz` (Linux) from <https://ollama.com/download> and the GitHub releases page | Attendees can't download them at the venue either |
| This file | So helpers can follow the steps |

**Format the drive as exFAT.** FAT32 can't hold files over 4 GB, and the weights blob is bigger than that.
exFAT can be read and written on macOS, Windows and Linux.

## 1. On a machine with good internet: pull and test

```bash
ollama pull gemma4:e4b
ollama run gemma4:e4b "hi"      # make sure it actually loads
ollama --version                # write this down; target machines need this version or newer
```

## 2. Export the model to the USB drive

A model is stored in two places under the models directory:

```
~/.ollama/models/
├── manifests/registry.ollama.ai/library/gemma4/e4b   # small JSON file that lists the blobs
└── blobs/sha256-<hash>                                # weight tensors, template, params, license
```

Copy only the blobs that the manifest lists. Don't copy the whole folder, which may hold models you don't need.

**macOS / Linux** (change `DEST` to the drive's mount point):

```bash
MODEL=gemma4; TAG=e4b
SRC="${OLLAMA_MODELS:-$HOME/.ollama/models}"     # Linux service install: /usr/share/ollama/.ollama/models
DEST=/Volumes/WORKSHOP/ollama-models              # Linux: /media/$USER/WORKSHOP/ollama-models
MAN="manifests/registry.ollama.ai/library/$MODEL/$TAG"

mkdir -p "$DEST/$(dirname "$MAN")" "$DEST/blobs"
cp "$SRC/$MAN" "$DEST/$MAN"
for d in $(grep -oE 'sha256:[a-f0-9]{64}' "$SRC/$MAN" | sort -u); do
  cp -v "$SRC/blobs/${d/:/-}" "$DEST/blobs/"
done
```

To ship more models, run the block again with a different `MODEL`/`TAG`. The models go into the same folder, and
blobs they share are only copied once.

## 3. Import on the target PC

1. Install Ollama from the installer on the USB drive. Don't pull anything.
2. Find the target's models directory:

   | OS | Models directory |
   |---|---|
   | macOS | `~/.ollama/models` |
   | Windows | `%USERPROFILE%\.ollama\models` |
   | Linux (installed with `install.sh`, runs as a systemd service) | `/usr/share/ollama/.ollama/models` |
   | Linux (you run `ollama serve` yourself) | `~/.ollama/models` |
   | Any OS with `OLLAMA_MODELS` set | that path |

3. Merge the USB folder into it. Merge, don't replace: the attendee may already have other models there.

**macOS / Linux (user install):**

```bash
SRC=/Volumes/WORKSHOP/ollama-models               # Linux: /media/$USER/WORKSHOP/ollama-models
DST="${OLLAMA_MODELS:-$HOME/.ollama/models}"
mkdir -p "$DST"
cp -Rv "$SRC/." "$DST/"
```

**Linux (systemd service install):** the files must belong to the `ollama` user.

```bash
SRC=/media/$USER/WORKSHOP/ollama-models
DST=/usr/share/ollama/.ollama/models
sudo mkdir -p "$DST"
sudo cp -Rv "$SRC/." "$DST/"
sudo chown -R ollama:ollama "$DST"
sudo systemctl restart ollama
```

**Windows (PowerShell):** replace `E:` with the USB drive letter.

```powershell
$src = "E:\ollama-models"
$dst = if ($env:OLLAMA_MODELS) { $env:OLLAMA_MODELS } else { "$env:USERPROFILE\.ollama\models" }
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Copy-Item -Path "$src\*" -Destination $dst -Recurse -Force
```

Then quit Ollama from the tray icon and start it again.

## 4. Verify

```bash
ollama list                          # gemma4:e4b should be listed at 9.5 GB (the ID may differ from yours; that's fine)
ollama run gemma4:e4b "hi"           # first load takes 20-40 s
./setup/check.sh                     # should show "model gemma4:e4b pulled"
```

If you suspect the copy is damaged (for example, the USB was pulled out mid-copy), check the blobs (about 1 minute
for `gemma4:e4b` on an SSD; longer when reading from USB). Each blob's file
name is its own SHA-256 hash, so you can check every file on the drive:

```bash
cd /Volumes/WORKSHOP/ollama-models/blobs
for f in sha256-*; do
  [ "$(shasum -a 256 "$f" | cut -d' ' -f1)" = "${f#sha256-}" ] && echo "OK  $f" || echo "BAD $f"
done
```

Use `sha256sum` instead of `shasum -a 256` on Linux. On Windows, `Get-FileHash <file>` prints the hash in uppercase;
compare it to the file name.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `ollama list` doesn't show the model | The files went to the wrong directory. Run `ollama serve` in a terminal and look for `OLLAMA_MODELS` in the `server config` line it prints. On a Linux service install, it's `/usr/share/ollama/...`, not your home folder. |
| Listed, but `ollama run` tries to download | A blob is missing. Compare the hashes in the manifest with the files in `blobs/`, then copy again. |
| `permission denied` on Linux | `sudo chown -R ollama:ollama /usr/share/ollama/.ollama/models` |
| `unknown model architecture` or a load error | The target's Ollama is older than the one that pulled the model. Install the version that's on the USB drive. |
| Copy fails at about 4 GB | The drive is FAT32. Reformat it as exFAT. |
| Works on the author's Mac but not on another OS or GPU | The blobs themselves are cross-platform. Before the event, test one machine of each OS you expect (macOS, Windows, Linux) with these exact files. |

## Speeding it up at the venue

- Bring **2-3 USB drives** with the same content. One drive shared by 20 people can take an hour to get around the
  room.
- Ask attendees to install Ollama and import the model **before** the workshop, and to bring their `check.sh` output.
  Only people who couldn't do that at home should need the USB drive.
- Plan B for machines that can't run the model: on the facilitator laptop, run `OLLAMA_HOST=0.0.0.0:11434 ollama serve`
  and have those attendees set `baseURL` in `setup/configs/opencode.local.json` to `http://<your-LAN-IP>:11434/v1`.
  Everyone then shares one model on one machine, which is slow with many users but needs no internet.
