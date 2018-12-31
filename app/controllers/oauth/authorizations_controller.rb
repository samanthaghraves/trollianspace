# frozen_string_literal: true

class Oauth::AuthorizationsController < Doorkeeper::AuthorizationsController
  skip_before_action :authenticate_resource_owner!

  before_action :store_current_location
  before_action :authenticate_resource_owner!
  before_action :set_pack

  include Localized

  private

  def store_current_location
    store_location_for(:user, request.url)
  end

<<<<<<< HEAD
  def render_success
    if skip_authorization? || (matching_token? && !truthy_param?('force_login'))
      redirect_or_render authorize_response
    elsif Doorkeeper.configuration.api_only
      render json: pre_auth
    else
      render :new
    end
  end

  def truthy_param?(key)
    ActiveModel::Type::Boolean.new.cast(params[key])
=======
  def set_pack
    use_pack 'auth'
>>>>>>> 7dd17d4e7bf91bf58e88f009bd39c94b24ae0d62
  end
end
