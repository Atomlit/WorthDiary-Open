// ============================================================================
// Worth Diary Emergency Vault - Autonomous Time-Lock Key Release Portal
// Open-source autonomous Google Apps Script Webhook & Dead-Man's Switch
// Official: https://www.worthdiary.com | App: https://app.worthdiary.com
// ============================================================================

var SCRIPT_VERSION = '1.0.7';

function initializeProperties() {
  try {
    var props = PropertiesService.getScriptProperties();
    // Only initialize if the script properties have never been initialized before
    if (!props.getProperty('INITIALIZED')) {
      props.setProperties({
        INITIALIZED: 'true',
        IS_ACTIVE: 'true',
        REVEAL_DATE_UTC: '{{REVEAL_DATE_UTC}}',
        VAULT_PASSWORD: '{{VAULT_PASSWORD}}',
        OWNER_NAME: '{{OWNER_NAME}}',
        UPDATE_SECRET: '{{UPDATE_SECRET}}',
        FILE_CREATED_AT_UTC: '{{FILE_CREATED_AT_UTC}}',
        VAULT_FILE_ID: '{{VAULT_FILE_ID}}',
        LAST_HEARTBEAT_UTC: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error('Properties initialization notice: ' + err);
  }
}

/**
 * Client-callable RPC method invoked via google.script.run from Index.html.
 * Allows the browser to fetch the unlocked status & password asynchronously without page reloads.
 */
function getVaultStatusJson() {
  try {
    initializeProperties();
    var props = {};
    try {
      props = PropertiesService.getScriptProperties().getProperties() || {};
    } catch (pErr) {
      props = {};
    }

    var isActive = props.IS_ACTIVE !== 'false' && Boolean(props.VAULT_PASSWORD) && Boolean(props.REVEAL_DATE_UTC);
    var ownerName = props.OWNER_NAME || '{{OWNER_NAME}}';

    if (!isActive) {
      return {
        status: 'deactivated',
        version: SCRIPT_VERSION,
        unlocked: false,
        deactivated: true,
        ownerName: ownerName,
        vaultFileId: '',
        fileCreatedAtUtc: '',
        revealDateUtc: '',
        serverTimeUtc: new Date().toISOString(),
        password: null,
        message: 'Emergency Vault is currently paused / inactive. No unlock countdown active.'
      };
    }

    var revealDateStr = props.REVEAL_DATE_UTC || '';
    var revealDate = revealDateStr ? new Date(revealDateStr) : null;
    var password = props.VAULT_PASSWORD || '';
    var fileCreatedAt = props.FILE_CREATED_AT_UTC || '';
    var vaultFileId = props.VAULT_FILE_ID || '';
    var now = new Date();

    var isUnlocked = Boolean(revealDate && !isNaN(revealDate.getTime()) && now.getTime() >= revealDate.getTime());

    return {
      status: 'healthy',
      version: SCRIPT_VERSION,
      unlocked: isUnlocked,
      ownerName: ownerName,
      vaultFileId: vaultFileId,
      fileCreatedAtUtc: fileCreatedAt,
      revealDateUtc: revealDateStr,
      serverTimeUtc: now.toISOString(),
      password: isUnlocked ? password : null,
      message: isUnlocked 
        ? 'Vault Unlocked. Decryption password released.' 
        : 'Vault is currently locked. Heartbeat active.'
    };
  } catch (err) {
    return { status: 'error', error: String(err) };
  }
}

function doGet(e) {
  try {
    initializeProperties();
    var props = {};
    try {
      props = PropertiesService.getScriptProperties().getProperties() || {};
    } catch (pErr) {
      props = {};
    }

    var isActive = props.IS_ACTIVE !== 'false' && Boolean(props.VAULT_PASSWORD) && Boolean(props.REVEAL_DATE_UTC);
    var ownerName = props.OWNER_NAME || '{{OWNER_NAME}}';
    var format = (e && e.parameter && e.parameter.format) || 'html';

    if (!isActive) {
      if (format === 'json') {
        var deactResult = {
          status: 'deactivated',
          version: SCRIPT_VERSION,
          unlocked: false,
          deactivated: true,
          ownerName: ownerName,
          vaultFileId: '',
          fileCreatedAtUtc: '',
          revealDateUtc: '',
          serverTimeUtc: new Date().toISOString(),
          password: null,
          message: 'Emergency Vault is currently paused / inactive. No unlock countdown active.'
        };
        return ContentService.createTextOutput(JSON.stringify(deactResult, null, 2))
          .setMimeType(ContentService.MimeType.JSON);
      }

      var htmlDeact = HtmlService.createHtmlOutputFromFile('Index').getContent();
      htmlDeact = htmlDeact
        .replace(/\{\{VERSION\}\}/g, SCRIPT_VERSION)
        .replace(/\{\{OWNER_NAME\}\}/g, escapeHtml(ownerName))
        .replace(/\{\{VAULT_FILE_ID\}\}/g, 'INACTIVE')
        .replace(/\{\{CREATED_DATE_FORMATTED\}\}/g, 'N/A')
        .replace(/\{\{REVEAL_DATE_FORMATTED\}\}/g, 'Vault Paused by Owner')
        .replace(/\{\{PASSWORD\}\}/g, '')
        .replace(/\{\{STATE_CLASS\}\}/g, 'is-deactivated')
        .replace(/\{\{REVEAL_DATE_ISO\}\}/g, '');

      return HtmlService.createHtmlOutput(htmlDeact)
        .setTitle(ownerName + ' - Emergency Vault Portal')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    var revealDateStr = props.REVEAL_DATE_UTC || '';
    var revealDate = revealDateStr ? new Date(revealDateStr) : null;
    var password = props.VAULT_PASSWORD || '';
    var fileCreatedAt = props.FILE_CREATED_AT_UTC || '';
    var vaultFileId = props.VAULT_FILE_ID || '';
    var now = new Date();

    var isUnlocked = Boolean(revealDate && !isNaN(revealDate.getTime()) && now.getTime() >= revealDate.getTime());

    if (format === 'json') {
      var result = {
        status: 'healthy',
        version: SCRIPT_VERSION,
        unlocked: isUnlocked,
        ownerName: ownerName,
        vaultFileId: vaultFileId,
        fileCreatedAtUtc: fileCreatedAt,
        revealDateUtc: revealDateStr,
        serverTimeUtc: now.toISOString(),
        password: isUnlocked ? password : null,
        message: isUnlocked 
          ? 'Vault Unlocked. Decryption password released.' 
          : 'Vault is currently locked. Heartbeat active.'
      };
      return ContentService.createTextOutput(JSON.stringify(result, null, 2))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var html = HtmlService.createHtmlOutputFromFile('Index').getContent();
    var revealDateIso = revealDate ? revealDate.toISOString() : '';
    var revealDateFormatted = revealDate ? revealDate.toUTCString() : 'Pending Configuration';
    var createdDateFormatted = fileCreatedAt ? new Date(fileCreatedAt).toUTCString() : 'N/A';

    html = html
      .replace(/\{\{VERSION\}\}/g, SCRIPT_VERSION)
      .replace(/\{\{OWNER_NAME\}\}/g, escapeHtml(ownerName))
      .replace(/\{\{VAULT_FILE_ID\}\}/g, escapeHtml(vaultFileId))
      .replace(/\{\{CREATED_DATE_FORMATTED\}\}/g, escapeHtml(createdDateFormatted))
      .replace(/\{\{REVEAL_DATE_FORMATTED\}\}/g, escapeHtml(revealDateFormatted))
      .replace(/\{\{PASSWORD\}\}/g, escapeHtml(password))
      .replace(/\{\{STATE_CLASS\}\}/g, isUnlocked ? 'is-unlocked' : 'is-locked')
      .replace(/\{\{REVEAL_DATE_ISO\}\}/g, revealDateIso);

    return HtmlService.createHtmlOutput(html)
      .setTitle(ownerName + ' - Emergency Vault Portal')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (globalErr) {
    return HtmlService.createHtmlOutput('<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem;background:#0b0f19;color:#fff;"><h2>Emergency Vault Webhook Notice</h2><p>' + escapeHtml(String(globalErr)) + '</p></body></html>');
  }
}

function doPost(e) {
  try {
    initializeProperties();
    var props = PropertiesService.getScriptProperties();
    var secret = props.getProperty('UPDATE_SECRET') || '{{UPDATE_SECRET}}';

    var data = {};
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid JSON payload' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (!secret || data.secret !== secret) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Unauthorized: invalid secret' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'wipe' || data.action === 'neutralize') {
      // Neutralize stored password and reveal date without destroying UPDATE_SECRET or INITIALIZED
      props.setProperties({
        INITIALIZED: 'true',
        IS_ACTIVE: 'false',
        VAULT_PASSWORD: '',
        REVEAL_DATE_UTC: '',
        VAULT_FILE_ID: '',
        FILE_CREATED_AT_UTC: '',
        LAST_HEARTBEAT_UTC: ''
      });
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'All vault encryption keys and countdown properties wiped successfully' 
      }))
      .setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'delete') {
      props.deleteAllProperties();
      props.setProperties({
        INITIALIZED: 'true',
        IS_ACTIVE: 'false'
      });
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'All script properties deleted successfully' 
      }))
      .setMimeType(ContentService.MimeType.JSON);
    }

    var updates = {
      INITIALIZED: 'true',
      IS_ACTIVE: 'true'
    };
    if (data.revealDateUtc) updates.REVEAL_DATE_UTC = data.revealDateUtc;
    if (data.password) updates.VAULT_PASSWORD = data.password;
    if (data.ownerName) updates.OWNER_NAME = data.ownerName;
    if (data.fileCreatedAtUtc) updates.FILE_CREATED_AT_UTC = data.fileCreatedAtUtc;
    if (data.vaultFileId) updates.VAULT_FILE_ID = data.vaultFileId;
    updates.LAST_HEARTBEAT_UTC = new Date().toISOString();

    props.setProperties(updates);

    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      updatedAt: new Date().toISOString(),
      revealDateUtc: updates.REVEAL_DATE_UTC || props.getProperty('REVEAL_DATE_UTC'),
      vaultFileId: updates.VAULT_FILE_ID || props.getProperty('VAULT_FILE_ID')
    }))
    .setMimeType(ContentService.MimeType.JSON);
  } catch (postErr) {
    return ContentService.createTextOutput(JSON.stringify({ error: String(postErr) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
