# frozen_string_literal: true

module Settings
  module TwoFactorAuthentication
<<<<<<< HEAD
    class RecoveryCodesController < ApplicationController
      layout 'admin'

      before_action :authenticate_user!
      before_action :set_body_classes

=======
    class RecoveryCodesController < BaseController
>>>>>>> 7dd17d4e7bf91bf58e88f009bd39c94b24ae0d62
      def create
        @recovery_codes = current_user.generate_otp_backup_codes!
        current_user.save!
        flash[:notice] = I18n.t('two_factor_authentication.recovery_codes_regenerated')
        render :index
      end

      private

      def set_body_classes
        @body_classes = 'admin'
      end
    end
  end
end
