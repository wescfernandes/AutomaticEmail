// import { BaseBrand } from '../Brand/BrandModel';
// import { BaseCategory } from '../Categories/CategoryModel';
// import { BaseOffer } from '../Offer/OfferModel';

export interface BannerMongoModel {
  _id: string;
  name: string;
  title: string;
  description: string;
  buttonLabel: string;
  active: boolean;
  coverImageUrl: string;
  tag: string;
  targetMpOfferId: string;
  targetMpBrandId: string;
  targetMpCategoryId: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  type: string;
}

export interface BaseBanner {
  _id: string;
  name: string;
  title: string;
  description: string;
  buttonLabel: string;
  active: boolean;
  coverImageUrl: string;
  coverImageTabletUrl: string;
  coverImageMobileUrl: string;
  tag: string;
  type: string;
  targetMpOfferId?: string;
  targetMpBrandId?: string;
  targetMpCategoryId?: string;
//   brand?: BaseBrand;
//   category?: BaseCategory;
//   offer?: BaseOffer;
  customUrlTarget?: string;
  visibilityTags?: string[] | null;
  flashCampaignIds: any;
}
