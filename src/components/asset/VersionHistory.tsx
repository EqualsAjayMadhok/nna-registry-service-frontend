import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Collapse,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  useTheme,
  Badge,
  MenuItem,
  Menu,
  alpha,
  Checkbox,
  ListItemIcon,
} from '@mui/material';
import {
  History as HistoryIcon,
  Restore as RestoreIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Compare as CompareIcon,
  Code as DiffIcon,
  AccountCircle as UserIcon,
  CalendarToday as DateIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import {
  Asset,
  VersionInfo,
  VersionChanges,
  FileChange,
  FieldChange,
  MetadataChange,
  AssetFile,
} from '../../types/asset.types';
import assetService from '../../services/api/asset.service';

interface DiffViewProps {
  oldValue: any;
  newValue: any;
  showAsDiff?: boolean;
}

interface FileChangeItemProps {
  file: AssetFile;
  changedProperties?: string[];
  action: 'added' | 'removed' | 'modified';
}

interface VersionHistoryProps {
  asset: Asset;
  onVersionChange: (versionNumber: string) => void;
  onCreateVersion: () => void;
  refreshAsset: () => void;
}

/**
 * DiffView component to highlight differences between values
 */
const DiffView: React.FC<DiffViewProps> = ({ oldValue, newValue, showAsDiff = true }) => {
  const theme = useTheme();

  // Handle different types of values
  const formatValue = (value: any): string => {
    if (value === undefined || value === null) {
      return 'none';
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  };

  // If not showing as diff, just show the new value
  if (!showAsDiff) {
    return <Typography variant="body2">{formatValue(newValue)}</Typography>;
  }

  const oldFormatted = formatValue(oldValue);
  const newFormatted = formatValue(newValue);

  // If values are the same, just show the value
  if (oldFormatted === newFormatted) {
    return <Typography variant="body2">{oldFormatted}</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Box
        sx={{
          bgcolor: alpha(theme.palette.error.light, 0.1),
          p: 0.5,
          borderRadius: 0.5,
          position: 'relative',
          pl: 2,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '4px',
            bgcolor: theme.palette.error.main,
            borderRadius: '4px 0 0 4px',
          }}
        />
        <Typography
          variant="body2"
          sx={{
            textDecoration: 'line-through',
            color: theme.palette.error.main,
            fontFamily: 'monospace',
          }}
        >
          {oldFormatted}
        </Typography>
      </Box>
      <Box
        sx={{
          bgcolor: alpha(theme.palette.success.light, 0.1),
          p: 0.5,
          borderRadius: 0.5,
          position: 'relative',
          pl: 2,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '4px',
            bgcolor: theme.palette.success.main,
            borderRadius: '4px 0 0 4px',
          }}
        />
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.success.main,
            fontFamily: 'monospace',
          }}
        >
          {newFormatted}
        </Typography>
      </Box>
    </Box>
  );
};

/**
 * FileChangeItem component to display file changes
 */
const FileChangeItem: React.FC<FileChangeItemProps> = ({ file, changedProperties, action }) => {
  const theme = useTheme();

  // Color based on action
  const getColorByAction = () => {
    switch (action) {
      case 'added':
        return theme.palette.success.main;
      case 'removed':
        return theme.palette.error.main;
      case 'modified':
        return theme.palette.warning.main;
      default:
        return theme.palette.text.primary;
    }
  };

  // Icon based on action
  const getIconByAction = () => {
    switch (action) {
      case 'added':
        return <AddIcon sx={{ color: theme.palette.success.main }} />;
      case 'removed':
        return <DeleteIcon sx={{ color: theme.palette.error.main }} />;
      case 'modified':
        return <EditIcon sx={{ color: theme.palette.warning.main }} />;
      default:
        return null;
    }
  };

  // Get file type icon based on mime type
  const getFileTypeIcon = () => {
    if (file.contentType.startsWith('image/')) {
      return (
        <Box
          component="img"
          src={file.thumbnailUrl || file.url}
          alt={file.filename}
          sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1 }}
        />
      );
    }

    return (
      <Box
        sx={{
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          borderRadius: 1,
          fontSize: '0.7rem',
          fontWeight: 'bold',
          color: getColorByAction(),
        }}
      >
        {file.contentType.split('/')[0].substring(0, 3).toUpperCase()}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 1,
        mb: 1,
        bgcolor: alpha(getColorByAction(), 0.05),
        borderRadius: 1,
        borderLeft: `4px solid ${getColorByAction()}`,
      }}
    >
      <Box sx={{ mr: 1.5 }}>{getIconByAction()}</Box>
      {getFileTypeIcon()}
      <Box sx={{ ml: 2, flexGrow: 1 }}>
        <Typography variant="body2" fontWeight="medium">
          {file.filename}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {(file.size / 1024).toFixed(2)} KB • {file.contentType}
        </Typography>
        {changedProperties && changedProperties.length > 0 && (
          <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {changedProperties.map(prop => (
              <Chip
                key={prop}
                label={prop}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  bgcolor: alpha(getColorByAction(), 0.1),
                  color: getColorByAction(),
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

/**
 * VersionHistory component to display and manage asset versions
 */
const VersionHistory: React.FC<VersionHistoryProps> = ({
  asset,
  onVersionChange,
  onCreateVersion,
  refreshAsset,
}) => {
  const theme = useTheme();

  // State
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [compareMode, setCompareMode] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [revertDialogOpen, setRevertDialogOpen] = useState(false);
  const [revertVersion, setRevertVersion] = useState<VersionInfo | null>(null);
  const [revertMessage, setRevertMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [contextVersion, setContextVersion] = useState<VersionInfo | null>(null);

  // Sort versions by creation date (newest first)
  const sortedVersions = asset.versionHistory
    ? [...asset.versionHistory].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : [];

  // Add current version to the top if not already included
  if (asset.version && asset.version.number) {
    const versionExists = sortedVersions.some(v => v.number === asset.version?.number);
    if (!versionExists) {
      sortedVersions.unshift(asset.version);
    }
  }

  // Toggle version expansion
  const toggleVersionExpand = (versionNumber: string) => {
    setExpandedVersions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(versionNumber)) {
        newSet.delete(versionNumber);
      } else {
        newSet.add(versionNumber);
      }
      return newSet;
    });
  };

  // Toggle version selection for comparison
  const toggleVersionSelection = (versionNumber: string) => {
    if (selectedVersions.includes(versionNumber)) {
      setSelectedVersions(prev => prev.filter(v => v !== versionNumber));
    } else {
      if (selectedVersions.length < 2) {
        setSelectedVersions(prev => [...prev, versionNumber]);
      }
    }
  };

  // Handle opening context menu
  const handleOpenContextMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    version: VersionInfo
  ) => {
    setAnchorEl(event.currentTarget);
    setContextVersion(version);
  };

  // Handle closing context menu
  const handleCloseContextMenu = () => {
    setAnchorEl(null);
    setContextVersion(null);
  };

  // Handle version change
  const handleVersionChange = (versionNumber: string) => {
    onVersionChange(versionNumber);
    handleCloseContextMenu();
  };

  // Handle comparison mode
  const handleCompareMode = () => {
    setCompareMode(!compareMode);
    setSelectedVersions([]);
  };

  // Handle revert dialog open
  const handleRevertDialogOpen = (version: VersionInfo) => {
    setRevertVersion(version);
    setRevertMessage(`Reverting to version ${version.number}`);
    setRevertDialogOpen(true);
    handleCloseContextMenu();
  };

  // Handle revert action
  const handleRevertToVersion = async () => {
    if (!revertVersion) return;

    setLoading(true);
    setError(null);

    try {
      await assetService.revertToVersion({
        assetId: asset.id,
        versionNumber: revertVersion.number,
        message: revertMessage,
      });

      // Refresh the asset to get the updated version information
      refreshAsset();

      // Close the dialog
      setRevertDialogOpen(false);
    } catch (err) {
      console.error('Error reverting to version:', err);
      setError('Failed to revert to the selected version.');
    } finally {
      setLoading(false);
    }
  };

  // Render file changes for a version
  const renderFileChanges = (changes?: VersionChanges) => {
    if (!changes) return null;

    return (
      <Box sx={{ mt: 1 }}>
        {/* Files Added */}
        {changes.filesAdded && changes.filesAdded.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Files Added
            </Typography>
            {changes.filesAdded.map((file, index) => (
              <FileChangeItem key={`add-${file.id || index}`} file={file} action="added" />
            ))}
          </Box>
        )}

        {/* Files Modified */}
        {changes.filesModified && changes.filesModified.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Files Modified
            </Typography>
            {changes.filesModified.map((fileChange, index) => (
              <FileChangeItem
                key={`mod-${fileChange.file.id || index}`}
                file={fileChange.file}
                changedProperties={fileChange.changedProperties}
                action="modified"
              />
            ))}
          </Box>
        )}

        {/* Files Removed */}
        {changes.filesRemoved && changes.filesRemoved.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Files Removed
            </Typography>
            {changes.filesRemoved.map((file, index) => (
              <FileChangeItem key={`rm-${file.id || index}`} file={file} action="removed" />
            ))}
          </Box>
        )}
      </Box>
    );
  };

  // Render field changes for a version
  const renderFieldChanges = (changes?: VersionChanges) => {
    if (!changes || !changes.fields || changes.fields.length === 0) {
      return null;
    }

    return (
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Field Changes
        </Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          {changes.fields.map((fieldChange, index) => (
            <Box key={index} sx={{ mb: index < changes.fields!.length - 1 ? 2 : 0 }}>
              <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                {fieldChange.field.toString()}
              </Typography>
              <DiffView oldValue={fieldChange.oldValue} newValue={fieldChange.newValue} />
              {index < changes.fields!.length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}
        </Paper>
      </Box>
    );
  };

  // Render metadata changes for a version
  const renderMetadataChanges = (changes?: VersionChanges) => {
    if (!changes || !changes.metadataChanges || changes.metadataChanges.length === 0) {
      return null;
    }

    return (
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Metadata Changes
        </Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          {changes.metadataChanges.map((metaChange, index) => (
            <Box key={index} sx={{ mb: index < changes.metadataChanges!.length - 1 ? 2 : 0 }}>
              <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                {metaChange.key}
              </Typography>
              <DiffView oldValue={metaChange.oldValue} newValue={metaChange.newValue} />
              {index < changes.metadataChanges!.length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}
        </Paper>
      </Box>
    );
  };

  // Render version comparison
  const renderVersionComparison = () => {
    if (selectedVersions.length !== 2) {
      return (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Select exactly two versions to compare
          </Typography>
        </Box>
      );
    }

    // Get the two selected versions
    const version1 = sortedVersions.find(v => v.number === selectedVersions[0]);
    const version2 = sortedVersions.find(v => v.number === selectedVersions[1]);

    if (!version1 || !version2) {
      return (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Selected versions not found
          </Typography>
        </Box>
      );
    }

    // Sort versions chronologically (older first)
    const [olderVersion, newerVersion] = [version1, version2].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return (
      <Paper sx={{ p: 3, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Version Comparison</Typography>
          <Button variant="outlined" size="small" onClick={handleCompareMode}>
            Exit Comparison
          </Button>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 3,
            bgcolor: alpha(theme.palette.primary.light, 0.1),
            p: 2,
            borderRadius: 1,
          }}
        >
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Typography variant="subtitle2" color="primary">
              Version {olderVersion.number}
            </Typography>
            <Typography variant="body2">
              {format(new Date(olderVersion.createdAt), 'PPP')}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="primary">
              Version {newerVersion.number}
            </Typography>
            <Typography variant="body2">
              {format(new Date(newerVersion.createdAt), 'PPP')}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {newerVersion.changes ? (
          <>
            {renderFieldChanges(newerVersion.changes)}
            {renderMetadataChanges(newerVersion.changes)}
            {renderFileChanges(newerVersion.changes)}

            {/* If no changes were detected */}
            {(!newerVersion.changes.fields || newerVersion.changes.fields.length === 0) &&
              (!newerVersion.changes.metadataChanges ||
                newerVersion.changes.metadataChanges.length === 0) &&
              (!newerVersion.changes.filesAdded || newerVersion.changes.filesAdded.length === 0) &&
              (!newerVersion.changes.filesModified ||
                newerVersion.changes.filesModified.length === 0) &&
              (!newerVersion.changes.filesRemoved ||
                newerVersion.changes.filesRemoved.length === 0) && (
                <Alert severity="info">No detailed changes detected between these versions.</Alert>
              )}
          </>
        ) : (
          <Alert severity="info">
            Change information is not available for this version comparison.
          </Alert>
        )}
      </Paper>
    );
  };

  return (
    <Box>
      {/* Version History Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <HistoryIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Version History</Typography>
        </Box>

        <Box>
          <Tooltip title="Compare Versions">
            <Button
              variant={compareMode ? 'contained' : 'outlined'}
              color="primary"
              startIcon={<CompareIcon />}
              onClick={handleCompareMode}
              size="small"
              sx={{ mr: 1 }}
            >
              Compare
            </Button>
          </Tooltip>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onCreateVersion}
            size="small"
          >
            New Version
          </Button>
        </Box>
      </Box>

      {/* Current Version Info */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          backgroundColor: alpha(theme.palette.primary.light, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle1">Current Version: {asset?.version?.number}</Typography>
            <Typography variant="body2" color="text.secondary">
              Created by {asset?.version?.createdBy} on{' '}
              {format(new Date(asset?.version?.createdAt || new Date()), 'PPP')}
            </Typography>
            {asset?.version?.message && (
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                "{asset.version.message}"
              </Typography>
            )}
          </Box>

          <Chip label="Current" color="primary" size="small" sx={{ fontWeight: 'bold' }} />
        </Box>
      </Paper>

      {/* Compare Mode UI */}
      {compareMode && renderVersionComparison()}

      {/* Version List */}
      <List component={Paper} variant="outlined" sx={{ mt: 3 }}>
        {sortedVersions.map((version, index) => {
          const isCurrent = version?.number === asset?.version?.number;
          const isExpanded = expandedVersions.has(version?.number);
          const isSelected = selectedVersions.includes(version?.number);

          return (
            <React.Fragment key={version.number}>
              <ListItem
                sx={{
                  bgcolor: isSelected
                    ? alpha(theme.palette.primary.main, 0.1)
                    : isCurrent
                    ? alpha(theme.palette.primary.light, 0.05)
                    : 'inherit',
                  transition: 'background-color 0.2s',
                }}
              >
                {compareMode && (
                  <Checkbox
                    checked={isSelected}
                    onChange={() => toggleVersionSelection(version.number)}
                    disabled={selectedVersions.length >= 2 && !isSelected}
                  />
                )}

                <ListItemAvatar>
                  <Badge
                    color="primary"
                    variant="dot"
                    invisible={!isCurrent}
                    overlap="circular"
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                  >
                    <Avatar sx={{ bgcolor: isExpanded ? 'primary.main' : 'grey.400' }}>
                      {version.number.split('.').pop() || '?'}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle1">Version {version.number}</Typography>
                      {isCurrent && (
                        <Chip
                          label="Current"
                          color="primary"
                          size="small"
                          sx={{ ml: 1, height: 20, fontSize: '0.65rem' }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <UserIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.6, fontSize: 16 }} />
                        <Typography variant="body2" sx={{ mr: 2 }}>
                          {version.createdBy}
                        </Typography>
                        <DateIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.6, fontSize: 16 }} />
                        <Typography variant="body2">
                          {format(new Date(version.createdAt), 'PPP')}
                        </Typography>
                      </Box>
                      {version.message && (
                        <Typography
                          variant="body2"
                          sx={{ mt: 0.5, fontStyle: 'italic', opacity: 0.8 }}
                        >
                          "{version.message}"
                        </Typography>
                      )}
                    </Box>
                  }
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />

                <ListItemSecondaryAction>
                  {!compareMode && (
                    <>
                      <Tooltip title="More Actions">
                        <IconButton edge="end" onClick={e => handleOpenContextMenu(e, version)}>
                          <MoreIcon />
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        edge="end"
                        onClick={() => toggleVersionExpand(version.number)}
                        sx={{ ml: 1 }}
                      >
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </>
                  )}
                </ListItemSecondaryAction>
              </ListItem>

              {/* Version Details */}
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ py: 2, px: 3, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                  {version.changes ? (
                    <>
                      {renderFieldChanges(version.changes)}
                      {renderMetadataChanges(version.changes)}
                      {renderFileChanges(version.changes)}

                      {/* If no changes were detected */}
                      {(!version.changes.fields || version.changes.fields.length === 0) &&
                        (!version.changes.metadataChanges ||
                          version.changes.metadataChanges.length === 0) &&
                        (!version.changes.filesAdded || version.changes.filesAdded.length === 0) &&
                        (!version.changes.filesModified ||
                          version.changes.filesModified.length === 0) &&
                        (!version.changes.filesRemoved ||
                          version.changes.filesRemoved.length === 0) && (
                          <Alert severity="info">
                            No detailed changes available for this version.
                          </Alert>
                        )}
                    </>
                  ) : (
                    <Alert severity="info">
                      Change information is not available for this version.
                    </Alert>
                  )}

                  {!isCurrent && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<CompareIcon />}
                        onClick={() => {
                          setCompareMode(true);
                          setSelectedVersions([version.number, asset?.version?.number || '']);
                        }}
                      >
                        Compare with Current
                      </Button>

                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<RestoreIcon />}
                        onClick={() => handleRevertDialogOpen(version)}
                      >
                        Revert to this Version
                      </Button>
                    </Box>
                  )}
                </Box>
              </Collapse>

              {index < sortedVersions.length - 1 && <Divider />}
            </React.Fragment>
          );
        })}
      </List>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseContextMenu}>
        {contextVersion && contextVersion.number !== asset?.version?.number && (
          <MenuItem onClick={() => handleVersionChange(contextVersion.number)}>
            <ListItemIcon>
              <DiffIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View this Version</ListItemText>
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            if (contextVersion) {
              setCompareMode(true);
              setSelectedVersions([contextVersion.number, asset?.version?.number || '']);
            }
            handleCloseContextMenu();
          }}
        >
          <ListItemIcon>
            <CompareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Compare with Current</ListItemText>
        </MenuItem>
        {contextVersion && asset.version && contextVersion.number !== asset.version.number && (
          <MenuItem
            onClick={() => {
              if (contextVersion) {
                handleRevertDialogOpen(contextVersion);
              }
            }}
          >
            <ListItemIcon>
              <RestoreIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Revert to this Version</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Revert Dialog */}
      <Dialog
        open={revertDialogOpen}
        onClose={() => setRevertDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Revert to Version {revertVersion?.number}</DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            Are you sure you want to revert to version {revertVersion?.number}? This will create a
            new version based on the selected version.
          </DialogContentText>

          <TextField
            autoFocus
            margin="dense"
            label="Revert Message"
            fullWidth
            value={revertMessage}
            onChange={e => setRevertMessage(e.target.value)}
            helperText="Describe why you are reverting to this version"
            disabled={loading}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevertDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleRevertToVersion}
            color="primary"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <RestoreIcon />}
          >
            {loading ? 'Reverting...' : 'Revert to this Version'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VersionHistory;
