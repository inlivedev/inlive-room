import type {
  InstancePeer,
  RTCOutboundRtpStreamStatsExtra,
} from './peer-types.d.ts';
class BandwidthController {
  _peer: InstancePeer;
  _available: number;
  _lastUpdated: number;
  _inboundTracks: {
    [key: string]: TrackInboundStats;
  };
  _outboundTracks: {
    [key: string]: TrackOutboundStats;
  };

  constructor(peer: InstancePeer) {
    this._peer = peer;
    this._available = 0;
    this._lastUpdated = 0;
    this._inboundTracks = {};
    this._outboundTracks = {};

    setInterval(this._updateStats, 3000);
  }

  getVideoOutboundTracksLength = (): number => {
    let length = 0;
    Object.keys(this._outboundTracks).forEach((trackId) => {
      if (this._outboundTracks[trackId].kind === 'video') {
        length++;
      }
    });
    return length;
  };

  getAudioOutboundTracksLength = (): number => {
    let length = 0;
    Object.keys(this._outboundTracks).forEach((trackId) => {
      if (this._outboundTracks[trackId].kind === 'audio') {
        length++;
      }
    });
    return length;
  };

  getAvailable = async (): Promise<number> => {
    await this._updateStats();
    return this._available;
  };

  _updateStats = async () => {
    if (
      Date.now() - this._lastUpdated < 1000 ||
      this._peer.getPeerConnection() == null
    ) {
      return;
    }

    const stats = await this._peer.getPeerConnection()?.getStats();
    this._lastUpdated = Date.now();
    let cpu = false;
    let bandwidth = false;

    stats?.forEach((report) => {
      switch (report.type) {
        case 'inbound-rtp':
          this._processInboudStats(report);
          break;

        case 'outbound-rtp':
          this._processOutboundStats(report);
          if (report.qualityLimitationReason === 'cpu') {
            cpu = true;
          } else if (report.qualityLimitationReason === 'bandwidth') {
            bandwidth = true;
          }
          break;
        case 'candidate-pair':
          if (typeof report.availableOutgoingBitrate !== 'undefined') {
            this._available = report.availableOutgoingBitrate;
          }
        default:
          break;
      }
    });

    let reason = 'none';

    if (cpu && bandwidth) reason = 'both';
    else if (cpu) reason = 'cpu';
    else if (bandwidth) reason = 'bandwidth';

    this._peer.sendStats({
      available_outgoing_bitrate: this._available,
      quality_limitation_reason: reason,
    });
  };

  _processInboudStats = (report: any) => {
    const trackId = report.trackIdentifier;
    if (typeof this._inboundTracks[trackId] == 'undefined') {
      this._inboundTracks[trackId] = {
        source:
          this._peer.getStreamByTrackId(report.trackIdentifier)?.source || '',
        kind: report.kind,
        bytesReceived: 0,
        bitrate: 0,
        lastUpdated: 0,
      };
    }

    if (
      this._inboundTracks[trackId].bytesReceived == 0 ||
      report.bytesReceived == 0 ||
      this._inboundTracks[trackId].lastUpdated == 0
    ) {
      this._inboundTracks[trackId].bytesReceived = report.bytesReceived;
      this._inboundTracks[trackId].lastUpdated = this._lastUpdated;
      return;
    }

    const deltaBytes =
      report.bytesReceived - this._inboundTracks[trackId].bytesReceived;

    this._inboundTracks[trackId].bytesReceived = report.bytesReceived;
    let bitrate = 0;
    const deltaMs =
      this._lastUpdated - this._inboundTracks[trackId].lastUpdated;
    bitrate = ((deltaBytes * 8) / deltaMs) * 1000;
    this._inboundTracks[trackId].bitrate = bitrate;
    this._inboundTracks[trackId].lastUpdated = this._lastUpdated;

    if (report.kind === 'video') {
      console.log(
        `stats for ${report.trackIdentifier}: \n ${bitrate}, fps: ${report.framesPerSecond}, resolution: ${report.frameWidth}x${report.frameHeight}`
      );
    }
  };

  _processOutboundStats = (report: RTCOutboundRtpStreamStatsExtra) => {
    const trackId = report.id;
    const reason = {
      cpu: false,
      bandwidth: false,
    };

    if (typeof this._outboundTracks[trackId] == 'undefined') {
      this._outboundTracks[trackId] = {
        rid: typeof report.rid !== 'undefined' ? report.rid : '',
        kind: report.kind,
        bytesSent: 0,
        bitrates: 0,
        lastUpdated: 0,
      };
    }

    if (this._outboundTracks[trackId].bytesSent == 0) {
      this._outboundTracks[trackId].bytesSent = report.bytesSent
        ? report.bytesSent
        : 0;
      this._outboundTracks[trackId].lastUpdated = this._lastUpdated;

      if (report.qualityLimitationReason === 'cpu' && report) {
        return 'cpu';
      }
    }

    const deltaMs =
      this._lastUpdated - this._outboundTracks[trackId].lastUpdated;

    const deltaBytes = report.bytesSent
      ? report.bytesSent
      : 0 - this._outboundTracks[trackId].bytesSent;

    const bitrate = Math.floor(((deltaBytes * 8) / deltaMs) * 1000);

    if (bitrate == 0) return;

    this._outboundTracks[trackId].bytesSent = report.bytesSent
      ? report.bytesSent
      : 0;

    this._outboundTracks[trackId].bitrates = bitrate;

    this._outboundTracks[trackId].lastUpdated = this._lastUpdated;
  };

  _getOutbountStats() {
    const stats = {
      audio: {
        totalBitrates: 0,
        count: 0,
      },
      video: {
        totalBitrates: 0,
        count: 0,
      },
    };

    let isZeroBitrate = false;

    Object.keys(this._outboundTracks).forEach((trackId) => {
      if (
        this._outboundTracks[trackId].kind === 'audio' &&
        (this._outboundTracks[trackId].rid === 'high' ||
          this._outboundTracks[trackId].rid === '')
      ) {
        if (this._outboundTracks[trackId].bitrates == 0) {
          isZeroBitrate = true;
          return;
        }
        stats.audio.count++;
        stats.audio.totalBitrates += this._outboundTracks[trackId].bitrates;
      } else {
        if (this._outboundTracks[trackId].bitrates == 0) {
          isZeroBitrate = true;
          return;
        }
        stats.video.count++;
        stats.video.totalBitrates += this._outboundTracks[trackId].bitrates;
      }
    });

    if (isZeroBitrate) return null;

    return stats;
  }
}

interface TrackInboundStats {
  kind: string;
  source: string;
  bytesReceived: number;
  bitrate: number;
  lastUpdated: number;
}

interface TrackOutboundStats {
  rid: string;
  kind: string;
  bytesSent: number;
  bitrates: number;
  lastUpdated: number;
}

export const CreateBandwidthController = (
  peer: InstancePeer
): BandwidthController => {
  return new BandwidthController(peer);
};
