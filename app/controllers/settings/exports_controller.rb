# frozen_string_literal: true

class Settings::ExportsController < Settings::BaseController
  include Authorization

<<<<<<< HEAD
  layout 'admin'

  before_action :authenticate_user!
  before_action :set_body_classes

=======
>>>>>>> 7dd17d4e7bf91bf58e88f009bd39c94b24ae0d62
  def show
    @export  = Export.new(current_account)
    @backups = current_user.backups
  end

  def create
    authorize :backup, :create?

    backup = current_user.backups.create!
    BackupWorker.perform_async(backup.id)

    redirect_to settings_export_path
  end

  private

  def set_body_classes
    @body_classes = 'admin'
  end
end
