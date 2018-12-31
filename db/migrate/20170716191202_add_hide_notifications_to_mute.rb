class AddHideNotificationsToMute < ActiveRecord::Migration[5.1]
<<<<<<< HEAD
  include Mastodon::MigrationHelpers

  disable_ddl_transaction!

  def up
    add_column_with_default :mutes, :hide_notifications, :boolean, default: true, allow_null: false
  end

  def down
    remove_column :mutes, :hide_notifications
=======
  def change
    add_column :mutes, :hide_notifications, :boolean, default: false, null: false
>>>>>>> 7dd17d4e7bf91bf58e88f009bd39c94b24ae0d62
  end
end
