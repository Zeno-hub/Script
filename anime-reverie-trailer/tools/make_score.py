#!/usr/bin/env python3
"""Generates public/audio/reverie-score.wav: an ORIGINAL procedural placeholder score
(pads, sub drone, pulse, risers and impacts timed to the trailer's cuts). Needs numpy only.
Replace it with real music whenever you have it."""
import wave
import numpy as np

SR = 32000
DUR = 80.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)
L = np.zeros(N)
R = np.zeros(N)


def seg(a, b):
    return slice(int(a * SR), min(int(b * SR), N))


def env(length, att, rel):
    n = int(length * SR)
    e = np.ones(n)
    a, r = int(att * SR), int(rel * SR)
    if a > 0:
        e[:a] = np.linspace(0, 1, a) ** 2
    if r > 0:
        e[-r:] = np.minimum(e[-r:], np.linspace(1, 0, r) ** 2)
    return e


def add(sig, a, pan=0.0):
    global L, R
    start = int(a * SR)
    n = min(len(sig), N - start)
    if n <= 0:
        return
    L[start:start + n] += sig[:n] * (1 - max(pan, 0))
    R[start:start + n] += sig[:n] * (1 + min(pan, 0))


def pad(freqs, start, length, amp, att=1.6, rel=1.8):
    n = int(length * SR)
    tt = np.arange(n) / SR
    out = np.zeros(n)
    for f in freqs:
        for det, pan in ((-0.4, -0.5), (0.0, 0.0), (0.45, 0.5)):
            ph = rng.uniform(0, 6.28)
            w = np.sin(2 * np.pi * (f + det) * tt + ph) + 0.35 * np.sin(2 * np.pi * (2 * f + det) * tt) + 0.12 * np.sin(2 * np.pi * (3 * f) * tt)
            add(w * env(length, att, rel) * amp / (len(freqs) * 3), start, pan)


def kick(start, amp):
    n = int(0.45 * SR)
    tt = np.arange(n) / SR
    f = 45 + 90 * np.exp(-tt * 28)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9)
    add(s * amp, start)


def boom(start, amp, length=2.2):
    n = int(length * SR)
    tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * 38 * tt) * np.exp(-tt * 2.2)
    nz = np.convolve(rng.normal(0, 1, n), np.ones(10) / 10, "same") * np.exp(-tt * 5)
    add((s + 0.5 * nz) * amp, start)


def riser(end, length, amp):
    n = int(length * SR)
    tt = np.arange(n) / SR
    nz = np.convolve(rng.normal(0, 1, n), np.ones(5) / 5, "same")
    sweep = np.sin(2 * np.pi * np.cumsum(180 + 1800 * (tt / length) ** 2) / SR)
    e = (tt / length) ** 2.2
    add((0.5 * nz + 0.4 * sweep) * e * amp, end - length)


# chord per section: opening, worlds 0..5, finale (Hz)
A, C, D, E, F, G = 220.0, 261.63, 293.66, 329.63, 349.23, 392.0
sections = [
    (0, 12, [110.0, 164.8, 220.0, 261.63], 0.5),
    (12, 21, [174.6, 261.63, 349.23, 440.0], 0.55),
    (21, 30, [130.8, 196.0, 261.63, 329.63], 0.6),
    (30, 39, [146.8, 220.0, 293.66, 349.23], 0.65),
    (39, 48, [116.5, 174.6, 233.1, 293.66], 0.7),
    (48, 57, [130.8, 196.0, 261.63, 392.0], 0.7),
    (57, 66, [110.0, 164.8, 220.0, 329.63], 0.8),
    (66, 80, [110.0, 164.8, 220.0, 261.63, 329.63, 440.0], 0.95),
]
for a, b, ch, amp in sections:
    pad(ch, a, (b - a) + 1.5, amp)

# sub drone that swells with the film
sub = np.sin(2 * np.pi * 55 * t) * (0.1 + 0.25 * np.clip((t - 8) / 70, 0, 1))
L += sub
R += sub

# pulse: soft kick every 0.75 s from the first world, louder per world
for k in range(int((66 - 12) / 0.75)):
    st = 12 + k * 0.75
    kick(st, 0.12 + 0.28 * (st - 12) / 54)

# risers into every cut and an impact on it
cuts = [12 + 9 * i for i in range(7)]  # 12 (world 0) ... 66 (finale)
for c in cuts:
    riser(c, 1.4, 0.35)
    boom(c, 0.6)
boom(66, 0.9, 3.0)

# opening sparkle: sparse high plucks so the dark intro is not empty
for st in np.arange(1.0, 11.0, 0.9):
    f = float(rng.choice([880.0, 1318.5, 1760.0, 1975.5]))
    n = int(1.6 * SR)
    tt = np.arange(n) / SR
    add(np.sin(2 * np.pi * f * tt) * np.exp(-tt * 3) * 0.05 * min(1.0, st / 4), st, float(rng.uniform(-0.7, 0.7)))

# master: gentle fade in/out, normalise to -3 dBFS peak
fade = np.clip(t / 2.5, 0, 1) * np.clip((DUR - t) / 3.5, 0, 1)
L *= fade
R *= fade
peak = max(np.abs(L).max(), np.abs(R).max())
g = 0.708 / peak
pcm = np.stack([L * g, R * g], axis=1)
pcm = (np.clip(pcm, -1, 1) * 32767).astype("<i2")
with wave.open("public/audio/reverie-score.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote public/audio/reverie-score.wav", pcm.shape, f"{DUR}s @ {SR} Hz")
