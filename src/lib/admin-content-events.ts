export const ADMIN_CONTENT_SAVE_REQUEST_EVENT = 'admin-content-save:request';
export const ADMIN_CONTENT_SAVE_STATE_EVENT = 'admin-content-save:state';
export const ADMIN_CONTENT_SAVE_RESULT_EVENT = 'admin-content-save:result';

export type AdminContentSaveStateDetail = {
  saving: boolean;
};

export type AdminContentSaveResultDetail = {
  status: 'success' | 'error';
  message: string;
};
