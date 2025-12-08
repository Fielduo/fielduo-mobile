// utils/assetValidator.ts
export const validateAsset = (asset: {
  assetName: string;
  assetType: string;
  status: string;
}) => {
  if (!asset.assetName.trim()) return 'Asset Name is required';
  if (!asset.assetType) return 'Asset Type is required';
  if (!asset.status) return 'Status is required';
  return null;
};
