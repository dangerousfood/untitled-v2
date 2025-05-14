<?xml version="1.0" encoding="utf-8" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
    <html>
        <head>
            <title>RTMP Statistics</title>
            <style type="text/css">
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    background-color: #f8f9fa;
                    color: #333;
                }
                h1, h2, h3, h4 {
                    color: #2c3e50;
                }
                table {
                    border-collapse: collapse;
                    width: 100%;
                    margin-bottom: 20px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #4CAF50;
                    color: white;
                }
                tr:nth-child(even) {
                    background-color: #f2f2f2;
                }
                .active {
                    color: green;
                    font-weight: bold;
                }
                .inactive {
                    color: red;
                }
                .section {
                    margin-bottom: 30px;
                    padding: 15px;
                    background-color: white;
                    border-radius: 5px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
            </style>
        </head>
        <body>
            <div class="section">
                <h1>NGINX RTMP Statistics</h1>
                <xsl:apply-templates select="rtmp"/>
            </div>
        </body>
    </html>
</xsl:template>

<xsl:template match="rtmp">
    <div class="section">
        <h2>RTMP Server</h2>
        <table>
            <tr>
                <th>Uptime</th>
                <th>Connections</th>
                <th>Received bytes</th>
                <th>Sent bytes</th>
            </tr>
            <tr>
                <td><xsl:value-of select="uptime"/></td>
                <td><xsl:value-of select="naccepted"/></td>
                <td><xsl:value-of select="bytes_in"/></td>
                <td><xsl:value-of select="bytes_out"/></td>
            </tr>
        </table>
        <xsl:apply-templates select="server"/>
    </div>
</xsl:template>

<xsl:template match="server">
    <div class="section">
        <h3>Server: <xsl:value-of select="application/name"/></h3>
        <xsl:apply-templates select="application"/>
    </div>
</xsl:template>

<xsl:template match="application">
    <div class="section">
        <h4>Application: <xsl:value-of select="name"/></h4>
        <xsl:choose>
            <xsl:when test="count(live/stream)">
                <xsl:apply-templates select="live/stream"/>
            </xsl:when>
            <xsl:otherwise>
                <p>No active streams</p>
            </xsl:otherwise>
        </xsl:choose>
    </div>
</xsl:template>

<xsl:template match="stream">
    <table>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Client</th>
            <th>Time</th>
            <th>Bitrate</th>
        </tr>
        <tr>
            <td><xsl:value-of select="name"/></td>
            <td>
                <xsl:choose>
                    <xsl:when test="(bw_video > 0) or (meta/video)">
                        <span class="active">Active</span>
                    </xsl:when>
                    <xsl:otherwise>
                        <span class="inactive">Inactive</span>
                    </xsl:otherwise>
                </xsl:choose>
            </td>
            <td>
                <xsl:value-of select="client"/>
            </td>
            <td>
                <xsl:value-of select="time"/>
            </td>
            <td>
                <xsl:value-of select="bw_video"/> bps
            </td>
        </tr>
    </table>
    <xsl:if test="meta/video">
        <div class="section">
            <h5>Video Information</h5>
            <table>
                <tr>
                    <th>Codec</th>
                    <th>Width</th>
                    <th>Height</th>
                    <th>Frame Rate</th>
                </tr>
                <tr>
                    <td><xsl:value-of select="meta/video/codec"/></td>
                    <td><xsl:value-of select="meta/video/width"/></td>
                    <td><xsl:value-of select="meta/video/height"/></td>
                    <td><xsl:value-of select="meta/video/frame_rate"/></td>
                </tr>
            </table>
        </div>
    </xsl:if>
</xsl:template>

</xsl:stylesheet> 