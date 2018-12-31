# frozen_string_literal: true

class Api::V1::MutesController < Api::BaseController
  before_action -> { doorkeeper_authorize! :follow, :'read:mutes' }
  before_action :require_user!
  after_action :insert_pagination_headers

  respond_to :json

  def index
    @data = @accounts = load_accounts
    render json: @accounts, each_serializer: REST::AccountSerializer
  end

  def details
    @data = @mutes = load_mutes
    render json: @mutes, each_serializer: REST::MuteSerializer
  end 

  private

  def load_accounts
    paginated_mutes.map(&:target_account)
  end

  def load_mutes
    paginated_mutes.includes(:account, :target_account).to_a
  end

  def paginated_mutes
    @paginated_mutes ||= Mute.eager_load(:target_account)
                             .where(account: current_account)
                             .paginate_by_max_id(
                               limit_param(DEFAULT_ACCOUNTS_LIMIT),
                               params[:max_id],
                               params[:since_id]
                             )
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def next_path
    if records_continue?
      url_for pagination_params(max_id: pagination_max_id)
    end
  end

  def prev_path
<<<<<<< HEAD
    unless paginated_mutes.empty?
      api_v1_mutes_url pagination_params(since_id: pagination_since_id)
=======
    unless@data.empty?
      url_for pagination_params(since_id: pagination_since_id)
>>>>>>> 7dd17d4e7bf91bf58e88f009bd39c94b24ae0d62
    end
  end

  def pagination_max_id
<<<<<<< HEAD
    paginated_mutes.last.id
  end

  def pagination_since_id
    paginated_mutes.first.id
  end

  def records_continue?
    paginated_mutes.size == limit_param(DEFAULT_ACCOUNTS_LIMIT)
=======
    if params[:action] == "details"
      @mutes.last.id
    else
      @accounts.last.muted_by_ids.last
    end
  end

  def pagination_since_id
    if params[:action] == "details"
      @mutes.first.id
    else
      @accounts.first.muted_by_ids.first
    end
  end

  def records_continue?
    @data.size == limit_param(DEFAULT_ACCOUNTS_LIMIT)
>>>>>>> 7dd17d4e7bf91bf58e88f009bd39c94b24ae0d62
  end

  def pagination_params(core_params)
    params.slice(:limit).permit(:limit).merge(core_params)
  end
end
