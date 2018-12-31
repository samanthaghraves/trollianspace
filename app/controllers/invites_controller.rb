# frozen_string_literal: true

class InvitesController < ApplicationController
  include Authorization

  layout 'admin'

  before_action :authenticate_user!
<<<<<<< HEAD
  before_action :set_body_classes
=======
  before_action :set_pack
>>>>>>> 7dd17d4e7bf91bf58e88f009bd39c94b24ae0d62

  def index
    authorize :invite, :create?

    @invites = invites
    @invite  = Invite.new
  end

  def create
    authorize :invite, :create?

    @invite      = Invite.new(resource_params)
    @invite.user = current_user

    if @invite.save
      redirect_to invites_path
    else
      @invites = invites
      render :index
    end
  end

  def destroy
    @invite = invites.find(params[:id])
    authorize @invite, :destroy?
    @invite.expire!
    redirect_to invites_path
  end

  private

  def set_pack
    use_pack 'settings'
  end

  def invites
    Invite.where(user: current_user).order(id: :desc)
  end

  def resource_params
    params.require(:invite).permit(:max_uses, :expires_in, :autofollow)
  end

  def set_body_classes
    @body_classes = 'admin'
  end
end
